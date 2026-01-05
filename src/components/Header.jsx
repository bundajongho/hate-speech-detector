import React from 'react';

const Header = () => {
  return (
    <header className="text-center space-y-4 animate-fade-in">
      <div className="inline-flex items-center justify-center w-20 h-20 md:w-24 md:h-24 bg-gradient-to-br from-primary-400/70 via-primary-500/70 to-primary-600/70 backdrop-blur-2xl rounded-3xl shadow-2xl border-2 border-white/50 mb-6 relative overflow-hidden">
        <svg className="w-10 h-10 md:w-12 md:h-12 text-white drop-shadow-2xl relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      </div>
      
      <div className="space-y-2">
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-neutral-text">
          Hate Speech Detector
        </h1>
        <p className="text-neutral-muted text-sm md:text-base max-w-xl mx-auto">
          Analisis dan deteksi ujaran kebencian menggunakan teknologi Natural Language Processing
        </p>
      </div>
      
      <div className="flex items-center justify-center gap-2 pt-2">
        <div className="h-px w-12 bg-gradient-to-r from-transparent to-primary-300"></div>
        <div className="w-2 h-2 rounded-full bg-primary-500"></div>
        <div className="h-px w-12 bg-gradient-to-l from-transparent to-primary-300"></div>
      </div>
    </header>
  );
};

export default Header;

