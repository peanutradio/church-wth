import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// 유튜브 재생목록(주일설교/새벽설교)의 영상을 posts_sermons 테이블로 동기화합니다.
// ※ 관리자 페이지의 "유튜브 동기화" 버튼과 동일한 로직 / 동일한 컬럼을 사용합니다.
//    (title, youtube_url, preacher, preached_at — youtube_url 기준 upsert)

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const supabase = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        )

        const API_KEY = Deno.env.get('YOUTUBE_API_KEY')
        if (!API_KEY) throw new Error('YOUTUBE_API_KEY is not configured')

        const PLAYLISTS = [
            { id: Deno.env.get('YOUTUBE_PLAYLIST_SUNDAY'), preacher: '주일설교' },
            { id: Deno.env.get('YOUTUBE_PLAYLIST_MORNING'), preacher: '새벽설교' },
        ]

        // 한 재생목록의 모든 영상을 페이지네이션으로 수집
        const fetchPlaylistVideos = async (playlistId: string, preacher: string) => {
            let items: any[] = []
            let pageToken: string | undefined = undefined

            do {
                const url = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${playlistId}&maxResults=50&key=${API_KEY}${pageToken ? `&pageToken=${pageToken}` : ''}`
                const res = await fetch(url)
                if (!res.ok) {
                    const err = await res.json()
                    throw new Error(`YouTube API Error: ${err.error?.message || res.statusText}`)
                }
                const data = await res.json()
                if (data.items) items = items.concat(data.items)
                pageToken = data.nextPageToken
            } while (pageToken)

            return items.map((item) => {
                const videoId = item.snippet.resourceId.videoId
                return {
                    title: item.snippet.title,
                    youtube_url: `https://www.youtube.com/watch?v=${videoId}`,
                    preacher,
                    preached_at: item.snippet.publishedAt.split('T')[0], // YYYY-MM-DD
                }
            })
        }

        const all: any[] = []
        for (const pl of PLAYLISTS) {
            if (!pl.id) continue
            const vids = await fetchPlaylistVideos(pl.id, pl.preacher)
            all.push(...vids)
        }

        // youtube_url 기준 중복 제거 (upsert 시 "동일 행 두 번 변경" 오류 방지)
        const uniqueMap = new Map<string, any>()
        for (const v of all) uniqueMap.set(v.youtube_url, v)
        const unique = Array.from(uniqueMap.values())

        if (unique.length === 0) {
            return new Response(
                JSON.stringify({ success: true, synced: 0, message: 'No videos found' }),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
        }

        const { error } = await supabase
            .from('posts_sermons')
            .upsert(unique, { onConflict: 'youtube_url' })

        if (error) throw error

        return new Response(
            JSON.stringify({ success: true, synced: unique.length, message: `Synced ${unique.length} sermons` }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    } catch (error) {
        return new Response(
            JSON.stringify({ success: false, error: error.message }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
        )
    }
})
