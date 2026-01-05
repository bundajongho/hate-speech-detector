import React, { useState, useEffect } from 'react';

const ProbabilityBars = ({ proba }) => {
  const [animatedProbs, setAnimatedProbs] = useState({
    Netral: 0,
    Agama: 0,
    Ras: 0
  });

  useEffect(() => {
    if (proba) {
      const timer = setTimeout(() => {
        setAnimatedProbs({
          Netral: proba.Netral || 0,
          Agama: proba.Agama || 0,
          Ras: proba.Ras || 0
        });
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [proba]);

  if (!proba) return null;

  const classes = [
    { 
      name: 'Netral', 
      color: 'bg-netral',
      textColor: 'text-netral',
      bg: 'bg-netral-light/10',
      border: 'border-netral-light/30',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      prob: animatedProbs.Netral 
    },
    { 
      name: 'Agama', 
      color: 'bg-agama',
      textColor: 'text-agama',
      bg: 'bg-agama-light/10',
      border: 'border-agama-light/30',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      ),
      prob: animatedProbs.Agama 
    },
    { 
      name: 'Ras', 
      color: 'bg-ras',
      textColor: 'text-ras',
      bg: 'bg-ras-light/10',
      border: 'border-ras-light/30',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      ),
      prob: animatedProbs.Ras 
    }
  ];

  const sortedClasses = [...classes].sort((a, b) => b.prob - a.prob);

  return (
    <div className="card p-6 md:p-8 animate-scale-in">
      <div className="flex items-center gap-2 mb-6">
        <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
        </svg>
        <h3 className="text-lg md:text-xl font-bold text-neutral-text">Probabilitas Klasifikasi</h3>
      </div>
      
      <div className="space-y-4">
        {sortedClasses.map((cls, index) => {
          const percentage = cls.prob * 100;
          const isHighest = index === 0 && percentage > 0;
          
          return (
            <div 
              key={cls.name}
              className={`p-5 rounded-2xl border-2 transition-all duration-500 backdrop-blur-2xl relative overflow-hidden group ${
                isHighest ? `${cls.bg} ${cls.border} bg-white/50 shadow-large` : 'bg-white/30 border-white/40 shadow-soft'
              }`}
            >
              {/* Glow effect for highest */}
              {isHighest && (
                <div className={`absolute inset-0 bg-gradient-to-br ${cls.bg} opacity-30 blur-2xl -z-10`}></div>
              )}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={`${cls.color} text-white p-2 rounded-lg`}>
                    {cls.icon}
                  </div>
                  <div>
                    <span className="font-semibold text-neutral-text text-sm md:text-base block">
                      {cls.name}
                    </span>
                    {isHighest && (
                      <span className="text-xs text-neutral-muted mt-0.5 block">
                        Kategori terdeteksi
                      </span>
                    )}
                  </div>
                </div>
                <span className={`text-lg md:text-xl font-bold ${
                  isHighest ? cls.textColor : 'text-neutral-muted'
                }`}>
                  {percentage.toFixed(1)}%
                </span>
              </div>
              
              <div className="relative h-2.5 bg-neutral-border rounded-full overflow-hidden">
                <div
                  className={`h-full ${cls.color} transition-all duration-1000 ease-out rounded-full`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ProbabilityBars;

