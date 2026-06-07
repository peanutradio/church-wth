import React from 'react';
import { ChevronDown, Youtube } from 'lucide-react';

const Hero = () => {
  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  const channelUrl =
    import.meta.env.VITE_YOUTUBE_CHANNEL_URL || 'https://www.youtube.com/@wethechurch0424';

  return (
    <section
      id="home"
      className="relative min-h-screen flex items-center justify-center text-center overflow-hidden bg-gradient-to-br from-church-pink via-[#F3E5F5] to-church-purple"
    >
      {/* 천천히 떠다니는 파스텔 블롭 (사진 대신 움직이는 비주얼) */}
      <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute -top-[10%] -left-[5%] w-[40rem] h-[40rem] rounded-full bg-church-pink/50 blur-3xl animate-blob"></div>
        <div className="absolute -bottom-[15%] -right-[5%] w-[38rem] h-[38rem] rounded-full bg-church-purple/50 blur-3xl animate-blob animation-delay-2000"></div>
        <div className="absolute top-[28%] right-[18%] w-[26rem] h-[26rem] rounded-full bg-[#F8BBD0]/40 blur-3xl animate-blob animation-delay-4000"></div>
      </div>

      {/* 콘텐츠 */}
      <div className="relative z-20 container mx-auto px-4">
        <p className="animate-fade-in-up inline-block px-5 py-1.5 mb-6 rounded-full border border-church-accent/30 bg-white/40 backdrop-blur-sm text-church-accent text-sm font-semibold tracking-[0.2em]">
          WE, THE CHURCH
        </p>

        <h1 className="animate-fade-in-up animate-delay-100 text-4xl md:text-6xl lg:text-7xl font-bold mb-6 tracking-tight text-gray-800 font-serif leading-tight">
          신앙과 일상이<br />함께 자라는 공간
        </h1>

        <p className="animate-fade-in-up animate-delay-200 text-lg md:text-2xl font-light text-gray-700 max-w-2xl mx-auto mb-10">
          위더처치에 오신 것을 진심으로 환영합니다.
        </p>

        <div className="animate-fade-in-up animate-delay-300 flex flex-col sm:flex-row gap-4 justify-center items-center">
          <button
            onClick={() => scrollTo('worship')}
            className="px-8 py-4 rounded-full bg-gradient-to-r from-church-accent to-[#C04578] text-white font-bold shadow-lg shadow-church-accent/30 hover:shadow-xl hover:-translate-y-0.5 transition-all"
          >
            예배 안내 보기
          </button>
          <a
            href={channelUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-8 py-4 rounded-full bg-white/70 backdrop-blur-sm text-gray-800 font-bold shadow-md hover:bg-white hover:-translate-y-0.5 transition-all flex items-center gap-2"
          >
            <Youtube className="w-5 h-5 text-red-600" />
            온라인 예배
          </a>
        </div>
      </div>

      {/* 스크롤 유도 화살표 */}
      <button
        onClick={() => scrollTo('worship')}
        aria-label="아래로 스크롤"
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 text-gray-600/70 hover:text-church-accent transition-colors animate-bounce"
      >
        <ChevronDown className="w-8 h-8" />
      </button>
    </section>
  );
};

export default Hero;
