import React from 'react';

const ResultDisplay = ({ result, proba }) => {
  const getConfig = (label) => {
    switch (label) {
      case 'Netral':
        return {
          color: 'text-netral',
          bg: 'bg-netral-light/10',
          border: 'border-netral-light/30',
          badge: 'bg-gradient-to-r from-netral to-netral-dark',
          icon: (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ),
          badgeIcon: (
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ),
          message: 'Kalimat ini tidak mengandung hate speech'
        };
      case 'Agama':
        return {
          color: 'text-agama',
          bg: 'bg-agama-light/10',
          border: 'border-agama-light/30',
          badge: 'bg-gradient-to-r from-agama to-agama-dark',
          icon: (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          ),
          badgeIcon: (
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          ),
          message: 'Kalimat mengandung hate speech AGAMA'
        };
      case 'Ras':
        return {
          color: 'text-ras',
          bg: 'bg-ras-light/10',
          border: 'border-ras-light/30',
          badge: 'bg-gradient-to-r from-ras to-ras-dark',
          icon: (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          ),
          badgeIcon: (
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          ),
          message: 'Kalimat mengandung hate speech RAS/ETNIS'
        };
      default:
        return null;
    }
  };

  const config = result ? getConfig(result.label) : null;

  return (
    <div className="card p-6 md:p-8 animate-scale-in">
      <div className="flex items-center gap-2 mb-6">
        <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
        </svg>
        <h2 className="text-lg md:text-xl font-bold text-neutral-text">Hasil Analisis</h2>
      </div>
      
      {result && config ? (
        <div className="space-y-6 animate-fade-in">
          <div className={`p-6 rounded-2xl border-2 ${config.border} ${config.bg} backdrop-blur-2xl bg-white/40 shadow-large relative overflow-hidden`}>
            {/* Subtle glow effect */}
            <div className={`absolute inset-0 bg-gradient-to-br ${config.bg} opacity-20 blur-xl -z-10`}></div>
            <div className="flex items-start gap-4">
              <div className={`${config.color} flex-shrink-0 mt-0.5`}>
                {config.icon}
              </div>
              <div className="flex-1">
                <p className={`${config.color} font-semibold text-base md:text-lg mb-3`}>
                  {config.message}
                </p>
                <div className="flex flex-wrap items-center gap-3">
                  <span className={`${config.badge} text-white font-bold py-2.5 px-5 rounded-xl text-sm inline-flex items-center gap-2 shadow-large backdrop-blur-sm border border-white/20`}>
                    {config.badgeIcon || config.icon}
                    <span>{result.label.toUpperCase()}</span>
                  </span>
                  <span className="text-sm text-neutral-muted font-medium">
                    Confidence: <span className="font-semibold text-neutral-text">{((result.proba[result.label] || 0) * 100).toFixed(1)}%</span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/40 backdrop-blur-2xl border border-white/50 shadow-large flex items-center justify-center">
            <svg className="w-8 h-8 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
          </div>
          <p className="text-neutral-muted font-medium">
            Masukkan kalimat untuk dianalisis
          </p>
        </div>
      )}
    </div>
  );
};

export default ResultDisplay;

