import React, { useState, useEffect } from 'react';

const CheckModelStatus = ({ onStatusChange }) => {
  const [isChecking, setIsChecking] = useState(false);
  const [modelStatus, setModelStatus] = useState(null);
  const [showCard, setShowCard] = useState(false);
  const [lastChecked, setLastChecked] = useState(null);

  const checkStatus = async () => {
    setIsChecking(true);
    setShowCard(true);
    
    try {
      const API_URL = import.meta.env.VITE_API_URL || '';
      let response;
      
      if (API_URL) {
        response = await fetch(`${API_URL}/api/model-status`);
      } else {
        // Fallback: check local files
        const jsonExists = await fetch('/model.json').then(r => r.ok).catch(() => false);
        response = {
          ok: true,
          json: async () => ({
            success: true,
            status: jsonExists ? 'ready' : 'not_available',
            message: jsonExists ? 'Model sudah di-fit dan siap digunakan.' : 'Model belum ada.',
            data: null,
            json_exists: jsonExists,
            pickle_exists: false,
            pickle_valid: false
          })
        };
      }
      
      const data = await response.ok ? await response.json() : {
        success: false,
        status: 'error',
        message: 'Tidak dapat terhubung ke server'
      };
      
      setModelStatus(data);
      setLastChecked(new Date());
      
      // Notify parent component about status change
      if (onStatusChange) {
        onStatusChange(data.status === 'ready', data);
      }
      
    } catch (error) {
      console.error('Error checking model status:', error);
      setModelStatus({
        success: false,
        status: 'error',
        message: 'Terjadi kesalahan saat mengecek status model.',
        error: error.message
      });
      
      if (onStatusChange) {
        onStatusChange(false, null);
      }
    } finally {
      setIsChecking(false);
    }
  };

  // Auto-check on mount
  useEffect(() => {
    checkStatus();
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'ready':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'not_available':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'invalid':
      case 'error':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'partial':
        return 'bg-orange-50 border-orange-200 text-orange-800';
      default:
        return 'bg-neutral-50 border-neutral-200 text-neutral-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'ready':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'not_available':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        );
      case 'invalid':
      case 'error':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };


  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="text-xl font-bold text-neutral-text">Status Model</h3>
        </div>
        <button
          onClick={checkStatus}
          disabled={isChecking}
          className="btn-primary flex items-center justify-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isChecking ? (
            <>
              <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Mengecek...</span>
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span>Cek Status</span>
            </>
          )}
        </button>
      </div>

      {showCard && modelStatus && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            {getStatusIcon(modelStatus.status)}
            <h3 className="text-lg font-bold text-neutral-text">Status Model</h3>
          </div>

          <div className={`p-4 rounded-xl border ${getStatusColor(modelStatus.status)}`}>
            <div className="flex items-start gap-2">
              {getStatusIcon(modelStatus.status)}
              <div className="flex-1">
                <p className="font-medium mb-1">
                  {modelStatus.status === 'ready' && 'Model Siap Digunakan'}
                  {modelStatus.status === 'not_available' && 'Model Belum Ada'}
                  {modelStatus.status === 'invalid' && 'Model Tidak Valid'}
                  {modelStatus.status === 'partial' && 'Model Tidak Lengkap'}
                  {modelStatus.status === 'error' && 'Error Mengecek Status'}
                </p>
                <p className="text-sm opacity-90">{modelStatus.message}</p>
              </div>
            </div>
          </div>


          {lastChecked && (
            <div className="pt-4 border-t border-neutral-200">
              <p className="text-xs text-neutral-muted">
                Terakhir dicek: {lastChecked.toLocaleTimeString('id-ID')}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CheckModelStatus;


