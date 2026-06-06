import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// 구글 드라이브 폴더의 주보 이미지를 posts_news 테이블로 동기화합니다.
// ※ 관리자 페이지의 "주보 동기화" 버튼과 동일한 로직 / 동일한 컬럼을 사용합니다.
//    (title, content, image_url) — 이미지는 Supabase Storage(news-images)에 복사 후
//    공개 URL을 저장합니다. (구글 thumbnailLink는 만료/referrer 문제가 있어 사용하지 않음)

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const SYNCED_NOTE = '구글 드라이브에서 동기화된 주보입니다.'

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const supabase = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        )

        // 관리자 버튼은 유튜브와 동일한 구글 키를 씁니다. 서버에서는 GOOGLE_API_KEY 우선, 없으면 YOUTUBE_API_KEY 사용
        const API_KEY = Deno.env.get('GOOGLE_API_KEY') ?? Deno.env.get('YOUTUBE_API_KEY')
        const FOLDER_ID = Deno.env.get('GOOGLE_DRIVE_FOLDER_ID')
        if (!API_KEY || !FOLDER_ID) throw new Error('Missing Google Drive configuration (API key / folder id)')

        // 1) 폴더 내 파일 목록
        const query = `'${FOLDER_ID}' in parents and mimeType != 'application/vnd.google-apps.folder' and trashed = false`
        const listRes = await fetch(
            `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&fields=files(id,name,mimeType)&key=${API_KEY}`
        )
        if (!listRes.ok) {
            const err = await listRes.json()
            throw new Error(`Drive API Error: ${err.error?.message || listRes.statusText}`)
        }
        const listData = await listRes.json()
        const imageFiles = (listData.files || []).filter((f: any) => f.mimeType?.startsWith('image/'))

        // 2) 기존 주보 제목(파일명)과 비교하여 새 파일만 추림
        const { data: existing } = await supabase.from('posts_news').select('title')
        const existingTitles = new Set((existing || []).map((n: any) => n.title))
        const newFiles = imageFiles.filter((f: any) => !existingTitles.has(f.name))

        let synced = 0
        const errors: string[] = []

        for (const file of newFiles) {
            try {
                // 드라이브에서 이미지 다운로드
                const dl = await fetch(`https://www.googleapis.com/drive/v3/files/${file.id}?alt=media&key=${API_KEY}`)
                if (!dl.ok) throw new Error(`download failed: ${dl.statusText}`)
                const blob = await dl.blob()

                const ext = file.name.split('.').pop()
                const uniqueName = `drive_${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`

                // Supabase Storage에 업로드
                const { error: upErr } = await supabase.storage
                    .from('news-images')
                    .upload(uniqueName, blob, { contentType: file.mimeType, cacheControl: '3600', upsert: false })
                if (upErr) throw upErr

                const { data: { publicUrl } } = supabase.storage.from('news-images').getPublicUrl(uniqueName)

                const { error: insErr } = await supabase.from('posts_news').insert([{
                    title: file.name,
                    content: SYNCED_NOTE,
                    image_url: publicUrl,
                }])
                if (insErr) throw insErr

                synced++
            } catch (e) {
                errors.push(`${file.name}: ${e.message}`)
            }
        }

        return new Response(
            JSON.stringify({
                success: true,
                synced,
                total: imageFiles.length,
                errors: errors.length ? errors : undefined,
                message: `Synced ${synced} bulletin(s)`,
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    } catch (error) {
        return new Response(
            JSON.stringify({ success: false, error: error.message }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
        )
    }
})
