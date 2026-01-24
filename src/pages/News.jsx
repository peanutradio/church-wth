import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

const News = () => {
    const [news, setNews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedImage, setSelectedImage] = useState(null); // State for modal

    useEffect(() => {
        fetchNews();
    }, []);

    const fetchNews = async () => {
        try {
            const { data, error } = await supabase
                .from('posts_news')
                .select('*');

            if (error) throw error;

            // Sort by date extracted from title
            // Official Format: YYMMDD (e.g., "260104_주일주보") -> Treated as 20260104
            // Legacy Format: MMDD (e.g., "1123_주일주보") -> Treated as 2025MMDD

            const sortedData = (data || []).sort((a, b) => {
                const getFullDate = (title) => {
                    const match = title.match(/^(\d+)/);
                    if (!match) return 0;

                    const numStr = match[1];

                    if (numStr.length === 4) {
                        // "1123" -> 20251123
                        return parseInt('2025' + numStr);
                    } else if (numStr.length === 6) {
                        // "260105" -> 20260105
                        return parseInt('20' + numStr);
                    }
                    // "20260105" -> 20260105
                    return parseInt(numStr);
                };

                const valA = getFullDate(a.title);
                const valB = getFullDate(b.title);

                return valB - valA;
            });

            setNews(sortedData);
        } catch (error) {
            console.error('Error fetching news:', error.message);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="pt-32 text-center">로딩 중...</div>;

    return (
        <div className="pt-32 pb-20 min-h-screen bg-gray-50">
            <div className="container mx-auto px-4">
                <h1 className="text-4xl font-bold text-center text-gray-900 mb-12 font-serif">교회 소식</h1>

                {news.length === 0 ? (
                    <div className="text-center text-gray-500 py-20">등록된 소식이 없습니다.</div>
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
                        {news.map((item) => (
                            <div key={item.id} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                                {item.image_url && (
                                    <div
                                        className="aspect-[3/4] w-full overflow-hidden cursor-pointer"
                                        onClick={() => setSelectedImage(item.image_url)}
                                    >
                                        <img
                                            src={item.image_url}
                                            alt={item.title}
                                            className="w-full h-full object-cover object-top hover:scale-105 transition-transform duration-300"
                                            referrerPolicy="no-referrer"
                                        />
                                    </div>
                                )}
                                <div className="p-6">

                                    <h3 className="text-xl font-bold text-gray-900 mb-2">{item.title}</h3>
                                    {item.content !== '구글 드라이브에서 동기화된 주보입니다.' && (
                                        <p className="text-gray-600 line-clamp-3">{item.content}</p>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Image Modal */}
                {selectedImage && (
                    <div
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm"
                        onClick={() => setSelectedImage(null)}
                    >
                        <div className="relative max-w-5xl w-full max-h-[90vh] flex items-center justify-center">
                            <img
                                src={selectedImage}
                                alt="Enlarged view"
                                className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
                                referrerPolicy="no-referrer"
                            />
                            <button
                                className="absolute top-4 right-4 text-white bg-black/50 rounded-full p-2 hover:bg-black/70 transition-colors"
                                onClick={() => setSelectedImage(null)}
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default News;
