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

        const FOLDER_ID = Deno.env.get('GOOGLE_DRIVE_FOLDER_ID')
        const GOOGLE_API_KEY = Deno.env.get('GOOGLE_API_KEY')

        if (!FOLDER_ID || !GOOGLE_API_KEY) {
            throw new Error('Missing Google Drive configuration')
        }

        // Fetch files from Google Drive folder
        const response = await fetch(
            `https://www.googleapis.com/drive/v3/files?q='${FOLDER_ID}'+in+parents&fields=files(id,name,thumbnailLink,createdTime,webViewLink)&key=${GOOGLE_API_KEY}&orderBy=createdTime desc&pageSize=20`
        )
        const data = await response.json()

        if (!data.files) {
            return new Response(
                JSON.stringify({ success: false, error: 'No files found' }),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
            )
        }

        let syncedCount = 0
        const errors = []

        for (const file of data.files) {
            try {
                const { error } = await supabaseClient
                    .from('posts_news')
                    .upsert({
                        drive_file_id: file.id,
                        title: file.name.replace(/\.[^/.]+$/, ''), // Remove file extension
                        content: '',
                        image_url: file.thumbnailLink,
                        link_url: file.webViewLink,
                        published_at: file.createdTime
                    }, {
                        onConflict: 'drive_file_id'
                    })

                if (error) {
                    errors.push(`Error upserting ${file.name}: ${error.message}`)
                } else {
                    syncedCount++
                }
            } catch (err) {
                errors.push(`Error processing ${file.name}: ${err.message}`)
            }
        }

        return new Response(
            JSON.stringify({
                success: true,
                synced: syncedCount,
                total: data.files.length,
                errors: errors.length > 0 ? errors : undefined,
                message: `Synced ${syncedCount} bulletin(s) from Google Drive`
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
