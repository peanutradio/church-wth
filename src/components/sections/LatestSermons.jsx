import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';

const LatestSermons = () => {
    const [sundaySermon, setSundaySermon] = useState(null);
    const [morningSermons, setMorningSermons] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLatestSermons = async () => {
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

                // Filter and sort sermons
                const sunday = data
                    .filter(s => s.preacher === '주일설교' || s.title?.includes('주일'))
                    .sort((a, b) => extractDate(b.title) - extractDate(a.title));

                const morning = data
                    .filter(s => s.preacher === '새벽설교' || s.title?.includes('새벽'))
                    .sort((a, b) => extractDate(b.title) - extractDate(a.title));

                setSundaySermon(sunday[0] || null);
                setMorningSermons(morning.slice(0, 3));
            } catch (error) {
                console.error('Error fetching latest sermons:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchLatestSermons();
    }, []);

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

    if (loading) return null;
    if (!sundaySermon && morningSermons.length === 0) return null;

    return (
        <section className="py-20 bg-white">
            <div className="container mx-auto px-4 max-w-6xl">
                <div className="flex justify-between items-end mb-10">
                    <h2 className="text-3xl font-bold text-gray-900 font-serif">최근 말씀</h2>
                    <Link to="/sermons" className="text-church-accent font-medium hover:text-church-purple transition-colors flex items-center gap-1">
                        말씀 더보기
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                        </svg>
                    </Link>
                </div>

                <div className="grid lg:grid-cols-2 gap-12">
                    {/* Main Sunday Sermon (Left) */}
                    {sundaySermon && (
                        <div className="group">
                            <div className="relative aspect-video rounded-2xl overflow-hidden shadow-lg mb-5">
                                <iframe
                                    width="100%"
                                    height="100%"
                                    src={`https://www.youtube.com/embed/${getYoutubeId(sundaySermon.youtube_url)}`}
                                    title={sundaySermon.title}
                                    frameBorder="0"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                    className="absolute inset-0"
                                />
                            </div>
                            <div>
                                <div className="flex items-center gap-3 mb-3">
                                    <span className="px-3 py-1 bg-church-purple text-white text-xs font-bold rounded-full">주일예배</span>
                                    <span className="text-sm text-gray-500">{formatDateFromTitle(sundaySermon.title)}</span>
                                </div>
                                <h3
                                    className="text-2xl font-bold text-gray-900 group-hover:text-church-purple transition-colors line-clamp-2 leading-tight"
                                    title={sundaySermon.title}
                                >
                                    {sundaySermon.title}
                                </h3>
                            </div>
                        </div>
                    )}

                    {/* Morning Sermons List (Right) */}
                    <div className="flex flex-col gap-5">
                        {morningSermons.map((sermon) => (
                            <div key={sermon.id} className="flex gap-4 group bg-gray-50 p-4 rounded-xl hover:bg-white hover:shadow-md transition-all items-center">
                                <div className="w-32 aspect-video rounded-lg overflow-hidden flex-shrink-0 bg-gray-200">
                                    <img
                                        src={`https://img.youtube.com/vi/${getYoutubeId(sermon.youtube_url)}/mqdefault.jpg`}
                                        alt={sermon.title}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="px-2 py-0.5 bg-church-accent/10 text-church-accent text-[10px] font-bold rounded-full">새벽예배</span>
                                        <span className="text-xs text-gray-400">{formatDateFromTitle(sermon.title)}</span>
                                    </div>
                                    <h4
                                        className="font-bold text-gray-900 text-sm line-clamp-2 group-hover:text-church-accent transition-colors mb-1"
                                        title={sermon.title}
                                    >
                                        {sermon.title}
                                    </h4>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default LatestSermons;
