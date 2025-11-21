import React from 'react';
import { Briefcase, Music, BookOpen, Heart, Sun } from 'lucide-react';

const About = () => {
    const philosophyItems = [
        {
            icon: Briefcase,
            title: 'We work',
            desc: "for God's Kingdom",
            color: "text-sky-700",
            bg: "bg-sky-50"
        },
        {
            icon: Music,
            title: 'We worship',
            desc: 'in the Spirit and truth',
            color: "text-purple-700",
            bg: "bg-purple-50"
        },
        {
            icon: BookOpen,
            title: 'We read',
            desc: 'the Bible',
            color: "text-emerald-700",
            bg: "bg-emerald-50"
        },
        {
            icon: Heart,
            title: 'We love',
            desc: 'our church and one another',
            color: "text-pink-600",
            bg: "bg-pink-50"
        },
        {
            icon: Sun,
            title: 'We live',
            desc: 'in the present',
            color: "text-orange-600",
            bg: "bg-orange-50"
        },
    ];

    return (
        <section id="about" className="py-24 bg-white">
            <div className="container mx-auto px-4">
                <div className="grid lg:grid-cols-2 gap-12 items-start">
                    <div className="space-y-4">
                        <div className="text-left mb-6">
                            <h3 className="text-4xl font-bold text-gray-900 font-serif mb-3">We, the Church is...</h3>
                            <p className="text-gray-500 text-lg">우리가 추구하는 5가지 핵심 가치</p>
                        </div>

                        <div className="space-y-3">
                            {philosophyItems.map((item, index) => (
                                <div key={index} className="bg-white p-5 rounded-2xl shadow-sm hover:shadow-md transition-all border border-gray-100 group hover:-translate-y-0.5 flex items-start gap-4">
                                    <div className={`w-12 h-12 ${item.bg} rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
                                        <item.icon className={`w-6 h-6 ${item.color}`} />
                                    </div>
                                    <div className="flex-1">
                                        <h4 className={`font-bold text-xl mb-0.5 ${item.color}`}>{item.title}</h4>
                                        <p className="text-gray-600 text-sm">{item.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="relative h-[600px] rounded-[2rem] overflow-hidden shadow-xl group border-2 border-purple-200/30">
                        {/* Background Image */}
                        <img
                            src="/pastel_purple_pink_bible_1763651288115.png"
                            alt="Church Philosophy"
                            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                        {/* Minimal Overlay for Text Readability */}
                        <div className="absolute inset-0 bg-white/5"></div>
                        <div className="absolute inset-0 bg-gradient-to-t from-purple-100/20 via-transparent to-transparent"></div>

                        {/* Content */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-10 text-stone-800">
                            <div className="space-y-8 max-w-md animate-fade-in-up">
                                <div className="inline-block px-4 py-1 border border-stone-400/50 rounded-full text-sm font-medium tracking-wider mb-2 backdrop-blur-sm text-stone-600">
                                    CHURCH PHILOSOPHY
                                </div>
                                <h3 className="text-4xl font-bold font-serif mb-6 text-stone-900 drop-shadow-sm">We, the Church</h3>

                                <div className="space-y-6 text-2xl leading-relaxed font-light tracking-wide text-stone-700">
                                    <p>
                                        성도의 <span className="font-bold text-stone-900">신앙</span>을 책임지고
                                    </p>
                                    <p>
                                        성도의 <span className="font-bold text-stone-900">인생</span>과 함께하며
                                    </p>
                                    <p>
                                        <span className="font-bold text-stone-900">주님의 나라</span>를 확장하는<br />
                                        교회가 되기를 꿈꿉니다.
                                    </p>
                                </div>

                                <div className="w-12 h-1 bg-stone-400/40 mx-auto my-10 rounded-full"></div>

                                <p className="text-base text-stone-600 font-medium tracking-wide">
                                    "건강하고 존경받는 교회가<br />되어 보겠습니다"
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default About;
