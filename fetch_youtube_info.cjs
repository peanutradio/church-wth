const https = require('https');

const API_KEY = 'AIzaSyC0lJS-ZBYnhWMZCZAQctjsEnmd-4Jkccc';
const HANDLE = '@wethechurch0424';

function httpsGet(url) {
    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                try {
                    resolve(JSON.parse(data));
                } catch (e) {
                    console.error("Parse error", data);
                    reject(e);
                }
            });
        }).on('error', reject);
    });
}

async function main() {
    try {
        // 1. Search for channel
        console.log(`Searching for channel: ${HANDLE}`);
        const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=channel&q=${encodeURIComponent(HANDLE)}&key=${API_KEY}`;
        const searchData = await httpsGet(searchUrl);

        if (!searchData.items || searchData.items.length === 0) {
            console.error('Channel not found');
            console.log(JSON.stringify(searchData, null, 2));
            return;
        }

        const channelId = searchData.items[0].id.channelId;
        console.log(`Found Channel ID: ${channelId}`);

        // 2. Get Playlists
        console.log('Fetching playlists...');
        const playlistsUrl = `https://www.googleapis.com/youtube/v3/playlists?part=snippet&channelId=${channelId}&maxResults=50&key=${API_KEY}`;
        const playlistsData = await httpsGet(playlistsUrl);

        if (!playlistsData.items) {
            console.error('No playlists found or API error:', playlistsData);
            return;
        }

        console.log('\nFound Playlists:');
        playlistsData.items.forEach(item => {
            console.log(`- [${item.snippet.title}] ID: ${item.id}`);
        });

    } catch (error) {
        console.error('Error:', error);
    }
}

main();
