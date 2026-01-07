import React, { useState } from 'react';

const TrainModelButton = ({ onTrainComplete }) => {
  const [isTraining, setIsTraining] = useState(false);
  const [trainingProgress, setTrainingProgress] = useState('');
  const [currentStep, setCurrentStep] = useState('');
  const [progressPercent, setProgressPercent] = useState(0);
  const [showCard, setShowCard] = useState(false);

  const parseProgress = (output) => {
    // Parse output untuk extract progress steps
    const steps = [
      { keyword: 'Loading dataset', label: 'Memuat dataset...', percent: 10 },
      { keyword: 'Cleaning data', label: 'Membersihkan data (NaN/duplikat/kosong)...', percent: 20 },
      { keyword: 'Preprocessing text', label: 'Preprocessing teks...', percent: 35 },
      { keyword: 'Splitting data', label: 'Membagi data training & testing...', percent: 50 },
      { keyword: 'Vectorizing', label: 'Vectorisasi TF-IDF...', percent: 65 },
      { keyword: 'Training model', label: 'Training model Naive Bayes...', percent: 80 },
      { keyword: 'Training Accuracy', label: 'Evaluasi model...', percent: 90 },
      { keyword: 'Menyimpan model.json', label: 'Menyimpan model...', percent: 92 },
      { keyword: 'model.json saved', label: 'Menyimpan model...', percent: 94 },
      { keyword: 'Menyalin ke public', label: 'Menyalin model ke public...', percent: 96 },
      { keyword: 'model.json copied', label: 'Model siap digunakan!', percent: 100 },
      { keyword: 'Model saved', label: 'Menyimpan model...', percent: 95 },
      { keyword: 'Model copied', label: 'Model siap digunakan!', percent: 100 }
    ];

    for (const step of steps) {
      if (output.includes(step.keyword)) {
        return { step: step.label, percent: step.percent };
      }
    }
    return { step: 'Memproses...', percent: progressPercent };
  };

  const handleTrain = async () => {
    setIsTraining(true);
    setShowCard(true);
    setTrainingProgress('Memulai training model...');
    setCurrentStep('Menyiapkan...');
    setProgressPercent(0);

    try {
      // Use environment variable for API URL, fallback to localhost for development
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      
      // Create AbortController for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 900000); // 15 minutes
      
      const response = await fetch(`${API_URL}/api/train`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      const data = await response.json();

      if (data.success) {
        // Parse output untuk progress
        const output = data.output || '';
        const progress = parseProgress(output);
        setCurrentStep('Model berhasil di-train!');
        setProgressPercent(100);
        setTrainingProgress('Training selesai!');
        
        showToast('Model berhasil di-train! Halaman akan dimuat ulang...', 'success');
        
        // Dispatch event untuk update modelLoaded di App.jsx
        window.dispatchEvent(new Event('modelTrained'));
        
        if (onTrainComplete) {
          onTrainComplete();
        }
        
        // Reload page after 2 seconds to load new model
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        setCurrentStep('Training gagal!');
        setProgressPercent(0);
        setTrainingProgress('Training gagal!');
        // Show detailed error message
        const errorMsg = data.message || data.error || 'Training failed';
        showToast(`Error: ${errorMsg}`, 'error');
        console.error('Training error details:', data);
        setIsTraining(false);
      }
    } catch (error) {
      if (error.name === 'AbortError') {
        setCurrentStep('Error: Training timeout (lebih dari 15 menit)');
        setProgressPercent(0);
        setTrainingProgress('Training memakan waktu terlalu lama. Coba train di local atau upgrade hosting.');
        showToast('Training timeout. Training memakan waktu terlalu lama untuk environment ini.', 'error');
      } else {
        console.error('Training error:', error);
        setCurrentStep('Error: Tidak dapat terhubung ke server');
        setProgressPercent(0);
        setTrainingProgress('Error: Tidak dapat terhubung ke server');
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        showToast(`Tidak dapat terhubung ke server. Pastikan API berjalan di ${API_URL}`, 'error');
      }
      setIsTraining(false);
    }
  };

  const showToast = (message, type) => {
    // Dispatch custom event untuk toast
    window.dispatchEvent(new CustomEvent('showToast', { detail: { message, type } }));
  };

  // Simulate progress updates during training
  React.useEffect(() => {
    if (isTraining && progressPercent < 90) {
      const interval = setInterval(() => {
        setProgressPercent(prev => {
          if (prev >= 90) return prev;
          return prev + 1;
        });
      }, 500);
      return () => clearInterval(interval);
    }
  }, [isTraining, progressPercent]);

  return (
    <>
      <button
        onClick={handleTrain}
        disabled={isTraining}
        className="btn-primary flex items-center justify-center gap-2 text-base disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isTraining ? (
          <>
            <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>Training Model...</span>
          </>
        ) : (
          <>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>Train Model</span>
          </>
        )}
      </button>

      {showCard && isTraining && (
        <div className="card p-6 md:p-8 animate-fade-in mt-4">
          <div className="flex items-center gap-2 mb-4">
            <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <h3 className="text-lg font-bold text-neutral-text">Training Model</h3>
          </div>

          <div className="space-y-4">
            {/* Progress Bar */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-neutral-text">{currentStep}</span>
                <span className="text-sm text-neutral-muted">{progressPercent}%</span>
              </div>
              <div className="w-full bg-neutral-200 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-primary-500 to-primary-600 h-3 rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${progressPercent}%` }}
                ></div>
              </div>
            </div>

            {/* Status Message */}
            {trainingProgress && (
              <div className="p-3 rounded-xl bg-primary-50 border border-primary-200">
                <p className="text-sm text-primary-800">{trainingProgress}</p>
              </div>
            )}

            {/* Steps List */}
            <div className="space-y-2 text-sm text-neutral-muted">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${progressPercent >= 10 ? 'bg-primary-500' : 'bg-neutral-300'}`}></div>
                <span>Memuat dataset</span>
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${progressPercent >= 20 ? 'bg-primary-500' : 'bg-neutral-300'}`}></div>
                <span>Membersihkan data</span>
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${progressPercent >= 35 ? 'bg-primary-500' : 'bg-neutral-300'}`}></div>
                <span>Preprocessing teks</span>
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${progressPercent >= 50 ? 'bg-primary-500' : 'bg-neutral-300'}`}></div>
                <span>Membagi data</span>
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${progressPercent >= 65 ? 'bg-primary-500' : 'bg-neutral-300'}`}></div>
                <span>Vectorisasi TF-IDF</span>
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${progressPercent >= 80 ? 'bg-primary-500' : 'bg-neutral-300'}`}></div>
                <span>Training model Naive Bayes</span>
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${progressPercent >= 90 ? 'bg-primary-500' : 'bg-neutral-300'}`}></div>
                <span>Evaluasi & menyimpan model</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {showCard && !isTraining && trainingProgress && (
        <div className="card p-4 mt-4">
          <p className="text-sm text-neutral-muted text-center">{trainingProgress}</p>
        </div>
      )}
    </>
  );
};

export default TrainModelButton;
