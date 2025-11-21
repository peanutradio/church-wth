import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

const Sermons = () => {
    const [sundaySermons, setSundaySermons] = useState([]);
    const [morningSermons, setMorningSermons] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchSermons();
    }, []);

    const fetchSermons = async () => {
        try {
            const { data, error } = await supabase
                .from('posts_sermons')
                .select('*');

            if (error) throw error;

            // Helper function to extract date from title (format: YYYY.MM.DD)
            const extractDate = (title) => {
                const match = title?.match(/(\d{4})\.(\d{2})\.(\d{2})/);
                if (match) {
                    return new Date(match[1], match[2] - 1, match[3]);
                }
                return new Date(0); // Return epoch if no date found
            };

            // Filter sermons based on preacher (category) or title keywords
            const sunday = data
                .filter(s => s.preacher === '주일설교' || s.title?.includes('주일'))
                .sort((a, b) => extractDate(b.title) - extractDate(a.title));

            const morning = data
                .filter(s => s.preacher === '새벽설교' || s.title?.includes('새벽'))
                .sort((a, b) => extractDate(b.title) - extractDate(a.title));

            setSundaySermons(sunday.slice(0, 3));
            setMorningSermons(morning.slice(0, 3));
        } catch (error) {
            console.error('Error fetching sermons:', error.message);
        } finally {
            setLoading(false);
        }
    };

    // Helper to extract YouTube ID
    const getYoutubeId = (url) => {
        if (!url) return null;
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    };

    // Helper to format date from title
    const formatDateFromTitle = (title) => {
        const match = title?.match(/(\d{4})\.(\d{2})\.(\d{2})/);
        if (match) {
            return `${match[1]}-${match[2]}-${match[3]}`;
        }
        return '';
    };

    const SermonCard = ({ sermon }) => {
        const videoId = getYoutubeId(sermon.youtube_url);
        return (
            <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow group">
                {videoId && (
                    <div className="aspect-video w-full bg-black relative">
                        <iframe
                            width="100%"
                            height="100%"
                            src={`https://www.youtube.com/embed/${videoId}`}
                            title={sermon.title}
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            className="absolute inset-0"
                        />
                    </div>
                )}
                <div className="p-6">
                    <div className="flex items-center gap-3 text-sm text-gray-500 mb-2">
                        <span className="px-2.5 py-0.5 bg-gray-100 rounded-full text-xs font-medium">{formatDateFromTitle(sermon.title)}</span>
                        <span className="text-church-accent">{sermon.preacher}</span>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 line-clamp-2 group-hover:text-church-purple transition-colors">
                        {sermon.title}
                    </h3>
                </div>
            </div>
        );
    };

    if (loading) return <div className="pt-32 text-center">로딩 중...</div>;

    return (
        <div className="pt-32 pb-20 min-h-screen bg-gray-50">
            <div className="container mx-auto px-4">
                <h1 className="text-4xl font-bold text-center text-gray-900 mb-16 font-serif">말씀 (Sermons)</h1>

                {/* Sunday Sermons Section */}
                <div className="max-w-6xl mx-auto mb-20">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                            <span className="w-1.5 h-8 bg-church-purple rounded-full"></span>
                            주일예배
                        </h2>
                    </div>
                    {sundaySermons.length > 0 ? (
                        <div className="grid md:grid-cols-3 gap-8">
                            {sundaySermons.map(sermon => (
                                <SermonCard key={sermon.id} sermon={sermon} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center text-gray-500 py-10 bg-white rounded-xl">등록된 주일예배 영상이 없습니다.</div>
                    )}
                </div>

                {/* Morning Sermons Section */}
                <div className="max-w-6xl mx-auto mb-20">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                            <span className="w-1.5 h-8 bg-church-accent rounded-full"></span>
                            새벽예배
                        </h2>
                    </div>
                    {morningSermons.length > 0 ? (
                        <div className="grid md:grid-cols-3 gap-8">
                            {morningSermons.map(sermon => (
                                <SermonCard key={sermon.id} sermon={sermon} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center text-gray-500 py-10 bg-white rounded-xl">등록된 새벽예배 영상이 없습니다.</div>
                    )}
                </div>

                {/* YouTube Channel Link */}
                <div className="text-center">
                    <p className="text-gray-600 mb-6">더 많은 말씀을 듣고 싶으신가요?</p>
                    <a
                        href="https://www.youtube.com/@wethechurch0424"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-3 px-8 py-4 bg-red-600 text-white font-bold rounded-full hover:bg-red-700 transition-all hover:scale-105 shadow-lg"
                    >
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z" />
                        </svg>
                        위더처치 유튜브 채널 바로가기
                    </a>
                </div>
            </div>
        </div>
    );
};

export default Sermons;
