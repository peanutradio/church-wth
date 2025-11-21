import React from 'react';
import { Clock, MapPin, Youtube, ArrowRight } from 'lucide-react';

const Worship = () => {
    const services = [
        {
            title: "새벽예배",
            time: "매주 월~금 오전 6:00",
            location: "Youtube 송출",
            link: "#", // 추후 업데이트
            isOnline: true
        },
        {
            title: "주일예배",
            time: "매주 주일 오후 1:30",
            location: "갤러리아 포레 B1 드림센터 101호",
            link: "#",
            isOnline: false
        },
        {
            title: "차세대 예배",
            time: "매주 주일 오후 1:00",
            location: "갤러리아 포레 B1 드림센터 101호",
            link: "#",
            isOnline: false
        }
    ];

    const handleButtonClick = (service) => {
        if (service.isOnline) {
            // Open YouTube channel in new tab
            const channelUrl = import.meta.env.VITE_YOUTUBE_CHANNEL_URL || 'https://www.youtube.com/@wethechurch0424';
            window.open(channelUrl, '_blank');
        } else {
            // Scroll to Location section on homepage
            const locationSection = document.getElementById('location');
            if (locationSection) {
                locationSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }
    };

    return (
        <section id="worship" className="py-20 bg-gray-50">
            <div className="container mx-auto px-4">
                <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-12">예배 안내</h2>

                <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                    {services.map((service, index) => (
                        <div key={index} className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-100 flex flex-col">
                            <h3 className="text-2xl font-bold text-gray-900 mb-6">{service.title}</h3>

                            <div className="space-y-4 flex-grow">
                                <div className="flex items-start gap-3 text-gray-600">
                                    <Clock className="w-5 h-5 text-church-purple mt-1 shrink-0" />
                                    <span>{service.time}</span>
                                </div>

                                <div className="flex items-start gap-3 text-gray-600">
                                    {service.isOnline ? (
                                        <Youtube className="w-5 h-5 text-red-500 mt-1 shrink-0" />
                                    ) : (
                                        <MapPin className="w-5 h-5 text-church-purple mt-1 shrink-0" />
                                    )}
                                    <span>{service.location}</span>
                                </div>
                            </div>

                            <button
                                className={`w-full mt-8 py-3.5 px-4 rounded-lg text-sm font-bold transition-all duration-300 flex items-center justify-center gap-2 shadow-md hover:shadow-lg hover:-translate-y-0.5 ${service.isOnline
                                    ? 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white'
                                    : 'bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white'
                                    }`}
                                onClick={() => handleButtonClick(service)}
                            >
                                {service.isOnline ? (
                                    <>
                                        <Youtube className="w-4 h-4" />
                                        <span>Youtube 바로가기</span>
                                    </>
                                ) : (
                                    <>
                                        <span>오시는 길 보기</span>
                                        <ArrowRight className="w-4 h-4" />
                                    </>
                                )}
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Worship;
