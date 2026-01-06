import React, { useState, useRef, useEffect } from 'react';
import Header from './components/Header';
import InputArea from './components/InputArea';
import ButtonGroup from './components/ButtonGroup';
import TrainModelButton from './components/TrainModelButton';
import ResultDisplay from './components/ResultDisplay';
import ProbabilityBars from './components/ProbabilityBars';
import ModelEvaluation from './components/ModelEvaluation';
import Footer from './components/Footer';
import Toast from './components/Toast';
import { predictHateSpeech } from './utils/model';

function App() {
  const [inputText, setInputText] = useState('');
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState({ message: '', type: 'info', isVisible: false });
  const [modelLoaded, setModelLoaded] = useState(false);
  const [isCheckingModel, setIsCheckingModel] = useState(true);
  const resultRef = useRef(null);
  
  const showToast = (message, type = 'info') => {
    setToast({ message, type, isVisible: true });
  };
  
  const hideToast = () => {
    setToast(prev => ({ ...prev, isVisible: false }));
  };

  const handleAnalyze = async () => {
    if (!inputText.trim()) {
      showToast('Masukkan kalimat terlebih dahulu!', 'warning');
      return;
    }

    if (!modelLoaded) {
      showToast('Model belum di-train! Silakan klik tombol "Train Model" terlebih dahulu.', 'warning');
      return;
    }

    setIsLoading(true);
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const prediction = await predictHateSpeech(inputText);
      setResult(prediction);
      
      // Scroll to result after a short delay to ensure DOM is updated
      setTimeout(() => {
        if (resultRef.current) {
          resultRef.current.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start',
            inline: 'nearest'
          });
        }
      }, 100);
    } catch (error) {
      console.error('Error predicting:', error);
      showToast('Terjadi kesalahan saat menganalisis kalimat.', 'error');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Auto-scroll when result changes
  useEffect(() => {
    if (result && resultRef.current) {
      setTimeout(() => {
        resultRef.current.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start',
          inline: 'nearest'
        });
      }, 100);
    }
  }, [result]);

  const handleClear = () => {
    setInputText('');
    setResult(null);
  };

  const handleModelTrained = () => {
    // Reload model info in ModelEvaluation
    window.dispatchEvent(new Event('modelTrained'));
    setModelLoaded(true); // Mark model as loaded after training
    showToast('Model berhasil di-train! Halaman akan dimuat ulang...', 'success');
  };

  // Check if model is available on mount
  useEffect(() => {
    const checkModel = async () => {
      setIsCheckingModel(true);
      try {
        const API_URL = import.meta.env.VITE_API_URL || '';
        let response;
        
        if (API_URL) {
          // Check via API
          response = await fetch(`${API_URL}/api/model-info`);
          if (response.ok) {
            const apiData = await response.json();
            if (apiData.success && apiData.data) {
              setModelLoaded(true);
            } else {
              setModelLoaded(false);
            }
          } else {
            setModelLoaded(false);
          }
        } else {
          // Check local file
          response = await fetch('/model.json');
          if (response.ok) {
            setModelLoaded(true);
          } else {
            setModelLoaded(false);
          }
        }
      } catch (error) {
        console.error('Error checking model:', error);
        setModelLoaded(false);
      } finally {
        setIsCheckingModel(false);
      }
    };
    
    checkModel();
  }, []);

  // Listen for toast events from TrainModelButton
  useEffect(() => {
    const handleToastEvent = (e) => {
      showToast(e.detail.message, e.detail.type);
    };
    window.addEventListener('showToast', handleToastEvent);
    return () => window.removeEventListener('showToast', handleToastEvent);
  }, []);

  // Listen for model trained event to update modelLoaded state
  useEffect(() => {
    const handleModelTrained = () => {
      // Re-check model after training
      const checkModel = async () => {
        try {
          const API_URL = import.meta.env.VITE_API_URL || '';
          let response;
          
          if (API_URL) {
            response = await fetch(`${API_URL}/api/model-info`);
            if (response.ok) {
              const apiData = await response.json();
              if (apiData.success && apiData.data) {
                setModelLoaded(true);
              }
            }
          } else {
            response = await fetch('/model.json');
            if (response.ok) {
              setModelLoaded(true);
            }
          }
        } catch (error) {
          console.error('Error checking model after training:', error);
        }
      };
      
      // Wait a bit for model to be saved
      setTimeout(checkModel, 1000);
    };
    
    window.addEventListener('modelTrained', handleModelTrained);
    return () => window.removeEventListener('modelTrained', handleModelTrained);
  }, []);

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden" style={{ overscrollBehavior: 'none', overscrollBehaviorY: 'none', overscrollBehaviorX: 'none' }}>
      {/* Enhanced soft gradient background */}
      <div className="fixed inset-0 bg-gradient-to-br from-blue-50 via-indigo-50/60 via-purple-50/80 to-pink-50/40 -z-20"></div>
      
      {/* Static gradient orbs with more blur - no animation */}
      <div className="fixed top-0 left-0 w-[500px] h-[500px] bg-gradient-to-br from-blue-300/40 to-blue-400/30 rounded-full blur-[120px] -z-10"></div>
      <div className="fixed bottom-0 right-0 w-[500px] h-[500px] bg-gradient-to-tl from-purple-300/40 to-pink-300/30 rounded-full blur-[120px] -z-10"></div>
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-gradient-to-r from-indigo-300/30 to-cyan-300/20 rounded-full blur-[100px] -z-10"></div>
      
      {/* Enhanced pattern overlay */}
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(99,102,241,0.12)_1px,transparent_0)] bg-[size:50px_50px] -z-10 opacity-50"></div>
      
      {/* Additional light rays effect */}
      <div className="fixed inset-0 bg-gradient-to-b from-transparent via-white/5 to-transparent -z-10 pointer-events-none"></div>
      
      <Toast 
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={hideToast}
      />
      
      <div className="flex-1 container mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8 md:py-12 relative z-0">
        <div className="space-y-6">
          <Header />
          
          <div className="card p-6 md:p-8 space-y-6 animate-fade-in">
            <InputArea 
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
            />
            
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1">
                <ButtonGroup 
                  onAnalyze={handleAnalyze}
                  onClear={handleClear}
                  isLoading={isLoading}
                  disabled={!modelLoaded || isCheckingModel}
                />
              </div>
              <div className="sm:w-auto">
                <TrainModelButton onTrainComplete={handleModelTrained} />
              </div>
            </div>
            {!modelLoaded && !isCheckingModel && (
              <div className="p-4 rounded-xl bg-yellow-50 border border-yellow-200 text-yellow-800 text-sm">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <span>Model belum di-train. Silakan klik tombol "Train Model" terlebih dahulu sebelum menganalisis kalimat.</span>
                </div>
              </div>
            )}
          </div>
          
          {result && (
            <div ref={resultRef} className="space-y-6 animate-slide-up">
              <ResultDisplay result={result} proba={result?.proba} />
              <ProbabilityBars proba={result.proba} />
              <ModelEvaluation />
            </div>
          )}
          
          {!result && (
            <div className="card p-8 animate-fade-in">
              <ResultDisplay result={null} proba={null} />
            </div>
          )}
          
          <Footer />
        </div>
      </div>
    </div>
  );
}

export default App;

