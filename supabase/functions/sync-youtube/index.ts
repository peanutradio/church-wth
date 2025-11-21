import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const supabaseClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        )

        const YOUTUBE_API_KEY = Deno.env.get('YOUTUBE_API_KEY')
        const PLAYLIST_IDS = {
            sunday: Deno.env.get('YOUTUBE_PLAYLIST_SUNDAY'),
            morning: Deno.env.get('YOUTUBE_PLAYLIST_MORNING')
        }

        const results = { sunday: 0, morning: 0, errors: [] }

        // Sync both playlists
        for (const [category, playlistId] of Object.entries(PLAYLIST_IDS)) {
            try {
                const response = await fetch(
                    `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=10&playlistId=${playlistId}&key=${YOUTUBE_API_KEY}`
                )
                const data = await response.json()

                if (!data.items) {
                    results.errors.push(`No items found for ${category}`)
                    continue
                }

                for (const item of data.items) {
                    const videoId = item.snippet.resourceId.videoId
                    const title = item.snippet.title
                    const thumbnail = item.snippet.thumbnails.high.url
                    const publishedAt = item.snippet.publishedAt

                    const { error } = await supabaseClient
                        .from('posts_sermons')
                        .upsert({
                            video_id: videoId,
                            title,
                            thumbnail_url: thumbnail,
                            category: category === 'sunday' ? '주일설교' : '새벽예배',
                            published_at: publishedAt
                        }, {
                            onConflict: 'video_id'
                        })

                    if (error) {
                        results.errors.push(`Error upserting ${videoId}: ${error.message}`)
                    } else {
                        results[category]++
                    }
                }
            } catch (err) {
                results.errors.push(`Error fetching ${category}: ${err.message}`)
            }
        }

        return new Response(
            JSON.stringify({
                success: true,
                synced: results,
                message: `Synced ${results.sunday} Sunday sermons and ${results.morning} morning prayers`
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
