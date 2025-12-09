import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useNavigate } from 'react-router-dom';
import MemberManagement from '../components/admin/MemberManagement';
import AdminStats from './AdminStats';

const Admin = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);
    const [activeTab, setActiveTab] = useState('members'); // 'news', 'sermons', 'members', or 'stats'

    // News Form State
    const [newsTitle, setNewsTitle] = useState('');
    const [newsContent, setNewsContent] = useState('');
    const [newsImage, setNewsImage] = useState(null);

    // Sermon Form State
    const [sermonTitle, setSermonTitle] = useState('');
    const [sermonUrl, setSermonUrl] = useState('');
    const [sermonPreacher, setSermonPreacher] = useState('');
    const [sermonDate, setSermonDate] = useState('');

    useEffect(() => {
        checkAdmin();
    }, []);

    const checkAdmin = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            navigate('/login');
            return;
        }

        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();

        if (profile?.role === 'admin') {
            setIsAdmin(true);
        } else {
            alert('관리자 권한이 없습니다.');
            navigate('/');
        }
        setLoading(false);
    };

    const handleNewsSubmit = async (e) => {
        e.preventDefault();
        try {
            let imageUrl = '';
            if (newsImage) {
                const fileExt = newsImage.name.split('.').pop();
                const fileName = `${Math.random()}.${fileExt}`;
                const { error: uploadError } = await supabase.storage
                    .from('news-images')
                    .upload(fileName, newsImage);

                if (uploadError) throw uploadError;

                const { data: { publicUrl } } = supabase.storage
                    .from('news-images')
                    .getPublicUrl(fileName);

                imageUrl = publicUrl;
            }

            const { error } = await supabase
                .from('posts_news')
                .insert([{ title: newsTitle, content: newsContent, image_url: imageUrl }]);

            if (error) throw error;
            alert('소식이 등록되었습니다.');
            setNewsTitle('');
            setNewsContent('');
            setNewsImage(null);
        } catch (error) {
            alert('Error: ' + error.message);
        }
    };

    const handleSermonSubmit = async (e) => {
        e.preventDefault();
        try {
            const { error } = await supabase
                .from('posts_sermons')
                .insert([{
                    title: sermonTitle,
                    youtube_url: sermonUrl,
                    preacher: sermonPreacher,
                    preached_at: sermonDate
                }]);

            if (error) throw error;
            alert('설교가 등록되었습니다.');
            setSermonTitle('');
            setSermonUrl('');
            setSermonPreacher('');
            setSermonDate('');
        } catch (error) {
            alert('Error: ' + error.message);
        }
    };

    const [syncMessage, setSyncMessage] = useState(null);

    const handleYoutubeSync = async () => {
        // Clear previous messages
        setSyncMessage(null);

        setLoading(true);
        try {
            const API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY;
            const PLAYLIST_SUNDAY = import.meta.env.VITE_YOUTUBE_PLAYLIST_SUNDAY;
            const PLAYLIST_MORNING = import.meta.env.VITE_YOUTUBE_PLAYLIST_MORNING;

            if (!API_KEY || !PLAYLIST_SUNDAY || !PLAYLIST_MORNING) {
                throw new Error('YouTube API 설정이 누락되었습니다. .env 파일을 확인해주세요.');
            }

            // 2. Fetch from YouTube Playlists (with pagination to get ALL videos)
            const fetchPlaylistVideos = async (playlistId, defaultPreacher) => {
                let allItems = [];
                let nextPageToken = null;

                do {
                    const url = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${playlistId}&maxResults=50&key=${API_KEY}${nextPageToken ? `&pageToken=${nextPageToken}` : ''}`;

                    const response = await fetch(url);

                    if (!response.ok) {
                        const errorData = await response.json();
                        throw new Error(`YouTube API Error: ${errorData.error?.message || response.statusText}`);
                    }

                    const data = await response.json();

                    if (data.items) {
                        allItems = allItems.concat(data.items);
                    }

                    nextPageToken = data.nextPageToken;
                } while (nextPageToken); // Continue until no more pages

                // Sort by publishedAt (newest first) after collecting all items
                const sortedItems = allItems.sort((a, b) =>
                    new Date(b.snippet.publishedAt) - new Date(a.snippet.publishedAt)
                );

                return sortedItems.map(item => {
                    const videoId = item.snippet.resourceId.videoId;
                    const url = `https://www.youtube.com/watch?v=${videoId}`;
                    return {
                        title: item.snippet.title,
                        youtube_url: url,
                        preacher: defaultPreacher,
                        preached_at: item.snippet.publishedAt.split('T')[0], // YYYY-MM-DD
                        // video_id is not needed for DB, but used for key if needed. 
                        // We use youtube_url as unique key.
                    };
                });
            };

            const sundayVideos = await fetchPlaylistVideos(PLAYLIST_SUNDAY, '주일설교');
            const morningVideos = await fetchPlaylistVideos(PLAYLIST_MORNING, '새벽설교');

            const allVideos = [...sundayVideos, ...morningVideos];

            // Deduplicate videos based on youtube_url to avoid "ON CONFLICT DO UPDATE command cannot affect row a second time" error
            const uniqueVideosMap = new Map();
            allVideos.forEach(video => {
                uniqueVideosMap.set(video.youtube_url, video);
            });
            const uniqueVideos = Array.from(uniqueVideosMap.values());

            if (uniqueVideos.length === 0) {
                setSyncMessage({ type: 'info', text: '가져올 영상이 없습니다.' });
                setLoading(false);
                return;
            }

            // 3. Upsert into Supabase (Insert or Update)
            const { error } = await supabase
                .from('posts_sermons')
                .upsert(uniqueVideos, { onConflict: 'youtube_url' });

            if (error) throw error;

            setSyncMessage({ type: 'success', text: `성공적으로 ${uniqueVideos.length}개의 영상을 동기화(업데이트)했습니다!` });

        } catch (error) {
            console.error('YouTube Sync Error:', error);
            setSyncMessage({ type: 'error', text: '동기화 실패: ' + error.message });
        } finally {
            setLoading(false);
        }
    };

    // Google Drive Sync Logic
    const handleDriveSync = async () => {
        setSyncMessage(null);
        setLoading(true);

        try {
            const API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY; // Using the same API key
            const FOLDER_ID = import.meta.env.VITE_GOOGLE_DRIVE_FOLDER_ID;

            if (!API_KEY || !FOLDER_ID) {
                throw new Error('Google Drive 설정이 누락되었습니다. .env 파일을 확인해주세요.');
            }

            // 1. List files in Google Drive Folder
            // Query: inside folder AND is not a folder (trash excluded)
            const query = `'${FOLDER_ID}' in parents and mimeType != 'application/vnd.google-apps.folder' and trashed = false`;
            // Request 'thumbnailLink' field
            const response = await fetch(
                `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&fields=files(id,name,mimeType,thumbnailLink)&key=${API_KEY}`
            );

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`Drive API Error: ${errorData.error?.message || response.statusText}`);
            }

            const data = await response.json();
            const files = data.files || [];

            if (files.length === 0) {
                setSyncMessage({ type: 'info', text: '가져올 이미지가 없습니다.' });
                setLoading(false);
                return;
            }

            // 2. Filter for images only
            const imageFiles = files.filter(file => file.mimeType.startsWith('image/'));

            if (imageFiles.length === 0) {
                setSyncMessage({ type: 'info', text: '폴더에 이미지 파일이 없습니다.' });
                setLoading(false);
                return;
            }

            // 3. Check for duplicates in Supabase (by title/filename)
            const { data: existingNews } = await supabase
                .from('posts_news')
                .select('title');

            const existingTitles = new Set(existingNews?.map(n => n.title) || []);
            const newFiles = imageFiles.filter(file => !existingTitles.has(file.name));

            if (newFiles.length === 0) {
                setSyncMessage({ type: 'info', text: '새로 가져올 주보 이미지가 없습니다. (이미 모두 등록됨)' });
                setLoading(false);
                return;
            }

            // 4. Process each new file - Download and upload to Supabase Storage
            let successCount = 0;
            for (const file of newFiles) {
                try {
                    // Download image from Google Drive
                    const downloadUrl = `https://www.googleapis.com/drive/v3/files/${file.id}?alt=media&key=${API_KEY}`;
                    const imageResponse = await fetch(downloadUrl);

                    if (!imageResponse.ok) {
                        throw new Error(`Failed to download image: ${imageResponse.statusText}`);
                    }

                    const imageBlob = await imageResponse.blob();

                    // Generate unique filename
                    const fileExtension = file.name.split('.').pop();
                    const uniqueFileName = `drive_${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExtension}`;

                    // Upload to Supabase Storage
                    const { data: uploadData, error: uploadError } = await supabase.storage
                        .from('news-images')
                        .upload(uniqueFileName, imageBlob, {
                            contentType: file.mimeType,
                            cacheControl: '3600',
                            upsert: false
                        });

                    if (uploadError) throw uploadError;

                    // Get public URL
                    const { data: { publicUrl } } = supabase.storage
                        .from('news-images')
                        .getPublicUrl(uniqueFileName);

                    // Insert into database
                    const { error } = await supabase
                        .from('posts_news')
                        .insert([{
                            title: file.name,
                            content: '구글 드라이브에서 동기화된 주보입니다.',
                            image_url: publicUrl
                        }]);

                    if (error) throw error;
                    successCount++;
                } catch (err) {
                    console.error(`Failed to sync file ${file.name}:`, err);
                }
            }

            setSyncMessage({ type: 'success', text: `성공적으로 ${successCount}개의 주보를 가져왔습니다!` });

        } catch (error) {
            console.error('Drive Sync Error:', error);
            setSyncMessage({ type: 'error', text: '동기화 실패: ' + error.message });
        } finally {
            setLoading(false);
        }
    };

    if (loading && !syncMessage) return <div className="pt-32 text-center">Loading...</div>;
    if (!isAdmin) return null;

    return (
        <div className="pt-32 pb-20 min-h-screen bg-gray-50">
            <div className="container mx-auto px-4 max-w-4xl">
                <h1 className="text-3xl font-bold text-gray-900 mb-8 font-serif">관리자 페이지</h1>

                <div className="flex gap-4 mb-8 border-b border-gray-200">
                    <button
                        onClick={() => setActiveTab('members')}
                        className={`pb-4 px-4 font-medium transition-colors ${activeTab === 'members'
                            ? 'text-church-accent border-b-2 border-church-accent'
                            : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        회원 관리
                    </button>
                    <button
                        onClick={() => setActiveTab('news')}
                        className={`pb-4 px-4 font-medium transition-colors ${activeTab === 'news'
                            ? 'text-church-accent border-b-2 border-church-accent'
                            : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        교회 소식 등록
                    </button>
                    <button
                        onClick={() => setActiveTab('sermons')}
                        className={`pb-4 px-4 font-medium transition-colors ${activeTab === 'sermons'
                            ? 'text-church-accent border-b-2 border-church-accent'
                            : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        설교 영상 등록
                    </button>
                    <button
                        onClick={() => setActiveTab('stats')}
                        className={`pb-4 px-4 font-medium transition-colors ${activeTab === 'stats'
                            ? 'text-church-accent border-b-2 border-church-accent'
                            : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        📊 통계 보기
                    </button>
                </div>

                <div className={activeTab === 'members' || activeTab === 'stats' ? '' : 'bg-white p-8 rounded-2xl shadow-sm'}>
                    {activeTab === 'members' ? (
                        <MemberManagement />
                    ) : activeTab === 'stats' ? (
                        <AdminStats />
                    ) : activeTab === 'news' ? (
                        <div className="space-y-8">
                            {/* Google Drive Sync Section */}
                            <div className="bg-blue-50 p-6 rounded-xl border border-blue-100">
                                <h3 className="text-lg font-bold text-blue-900 mb-2">주보 이미지 가져오기 (Google Drive)</h3>
                                <p className="text-sm text-blue-700 mb-4">
                                    구글 드라이브 폴더에서 최신 주보 이미지를 자동으로 가져옵니다.
                                </p>
                                <button
                                    type="button"
                                    onClick={handleDriveSync}
                                    disabled={loading}
                                    className={`flex items-center justify-center gap-2 w-full py-3 text-white font-bold rounded-lg transition-colors ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
                                        }`}
                                >
                                    {loading ? (
                                        <span>동기화 중...</span>
                                    ) : (
                                        <>
                                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                                <path d="M22.56 12.25c.02-.06.04-.12.04-.19 0-.17-.09-.34-.23-.44l-2.56-1.71H10.5l-2.5 1.67 2.5 1.67h9.28l2.78-1zM12.29 3.25c-.14-.1-.31-.1-.45 0L9.28 4.96l2.5 1.67 2.5-1.67-1.99-1.71zM4.21 12.06c-.14.1-.23.27-.23.44 0 .07.02.13.04.19l2.78 1h9.28l2.5-1.67-2.5-1.67H6.77l-2.56 1.71zM12.29 20.75c.14.1.31.1.45 0l2.56-1.71-2.5-1.67-2.5 1.67 1.99 1.71z" />
                                            </svg>
                                            주보 동기화 (Drive Sync)
                                        </>
                                    )}
                                </button>

                                {/* Sync Message Display */}
                                {syncMessage && (
                                    <div className={`mt-4 p-4 rounded-lg text-sm font-medium ${syncMessage.type === 'success' ? 'bg-green-100 text-green-800' :
                                        syncMessage.type === 'error' ? 'bg-red-100 text-red-800' :
                                            'bg-blue-100 text-blue-800'
                                        }`}>
                                        {syncMessage.text}
                                    </div>
                                )}
                            </div>

                            <div className="relative">
                                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                                    <div className="w-full border-t border-gray-300"></div>
                                </div>
                                <div className="relative flex justify-center">
                                    <span className="px-2 bg-white text-sm text-gray-500">또는 직접 등록</span>
                                </div>
                            </div>

                            <form onSubmit={handleNewsSubmit} className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">제목</label>
                                    <input
                                        type="text"
                                        value={newsTitle}
                                        onChange={(e) => setNewsTitle(e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-church-purple focus:border-transparent"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">내용</label>
                                    <textarea
                                        value={newsContent}
                                        onChange={(e) => setNewsContent(e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-church-purple focus:border-transparent h-32"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">이미지</label>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => setNewsImage(e.target.files[0])}
                                        className="w-full"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    className="w-full py-3 bg-church-purple text-white font-bold rounded-lg hover:bg-purple-400 transition-colors"
                                >
                                    등록하기
                                </button>
                            </form>
                        </div>
                    ) : (
                        <div className="space-y-8">
                            {/* YouTube Sync Section */}
                            <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                                <h3 className="text-lg font-bold text-gray-900 mb-2">유튜브 영상 가져오기</h3>
                                <p className="text-sm text-gray-600 mb-4">
                                    등록된 재생목록(주일설교, 새벽설교)에서 최신 영상을 자동으로 가져옵니다.
                                </p>
                                <button
                                    type="button"
                                    onClick={handleYoutubeSync}
                                    disabled={loading}
                                    className={`flex items-center justify-center gap-2 w-full py-3 text-white font-bold rounded-lg transition-colors ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700'
                                        }`}
                                >
                                    {loading ? (
                                        <span>동기화 중...</span>
                                    ) : (
                                        <>
                                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                                <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z" />
                                            </svg>
                                            유튜브 동기화 (YouTube Sync)
                                        </>
                                    )}
                                </button>

                                {/* Sync Message Display */}
                                {syncMessage && (
                                    <div className={`mt-4 p-4 rounded-lg text-sm font-medium ${syncMessage.type === 'success' ? 'bg-green-100 text-green-800' :
                                        syncMessage.type === 'error' ? 'bg-red-100 text-red-800' :
                                            'bg-blue-100 text-blue-800'
                                        }`}>
                                        {syncMessage.text}
                                    </div>
                                )}
                            </div>

                            <div className="relative">
                                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                                    <div className="w-full border-t border-gray-300"></div>
                                </div>
                                <div className="relative flex justify-center">
                                    <span className="px-2 bg-white text-sm text-gray-500">또는 직접 등록</span>
                                </div>
                            </div>

                            <form onSubmit={handleSermonSubmit} className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">설교 제목</label>
                                    <input
                                        type="text"
                                        value={sermonTitle}
                                        onChange={(e) => setSermonTitle(e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-church-purple focus:border-transparent"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">설교자</label>
                                    <input
                                        type="text"
                                        value={sermonPreacher}
                                        onChange={(e) => setSermonPreacher(e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-church-purple focus:border-transparent"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">설교 날짜</label>
                                    <input
                                        type="date"
                                        value={sermonDate}
                                        onChange={(e) => setSermonDate(e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-church-purple focus:border-transparent"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">YouTube URL</label>
                                    <input
                                        type="url"
                                        value={sermonUrl}
                                        onChange={(e) => setSermonUrl(e.target.value)}
                                        placeholder="https://youtube.com/..."
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-church-purple focus:border-transparent"
                                        required
                                    />
                                </div>
                                <button
                                    type="submit"
                                    className="w-full py-3 bg-church-purple text-white font-bold rounded-lg hover:bg-purple-400 transition-colors"
                                >
                                    등록하기
                                </button>
                            </form>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Admin;
