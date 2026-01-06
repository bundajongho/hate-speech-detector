import React, { useState } from 'react';

const TrainModelButton = ({ onTrainComplete }) => {
  const [isTraining, setIsTraining] = useState(false);
  const [trainingProgress, setTrainingProgress] = useState('');

  const handleTrain = async () => {
    setIsTraining(true);
    setTrainingProgress('Memulai training model...');

    try {
      // Use environment variable for API URL, fallback to localhost for development
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      
      const response = await fetch(`${API_URL}/api/train`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (data.success) {
        setTrainingProgress('Training selesai!');
        showToast('Model berhasil di-train!', 'success');
        if (onTrainComplete) {
          onTrainComplete();
        }
        // Reload page after 2 seconds to load new model
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        setTrainingProgress('Training gagal!');
        showToast(`Error: ${data.error}`, 'error');
      }
    } catch (error) {
      console.error('Training error:', error);
      setTrainingProgress('Error: Tidak dapat terhubung ke server');
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      showToast(`Tidak dapat terhubung ke server. Pastikan API berjalan di ${API_URL}`, 'error');
    } finally {
      setIsTraining(false);
      setTimeout(() => setTrainingProgress(''), 5000);
    }
  };

  const showToast = (message, type) => {
    // Dispatch custom event untuk toast
    window.dispatchEvent(new CustomEvent('showToast', { detail: { message, type } }));
  };

  return (
    <div className="flex flex-col gap-2">
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
      {trainingProgress && (
        <p className="text-xs text-neutral-muted text-center">{trainingProgress}</p>
      )}
    </div>
  );
};

export default TrainModelButton;

