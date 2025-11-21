import React from 'react';

const Hero = () => {
  return (
    <section id="home" className="relative h-screen flex items-center justify-center text-center overflow-hidden bg-gradient-to-br from-church-pink via-[#F3E5F5] to-church-purple">

      <div className="relative z-20 container mx-auto px-4 animate-fade-in-up">
        <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight text-gray-800 font-serif">
          WE, THE CHURCH에<br className="md:hidden" /> 오신 것을 환영합니다.
        </h1>
        <p className="text-xl md:text-2xl font-light text-gray-700 max-w-2xl mx-auto">
          신앙과 일상이 함께 자라는 공간,<br />
          위더처치를 소개합니다.
        </p>
      </div>
    </section>
  );
};

export default Hero;
