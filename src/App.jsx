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
    showToast('Model berhasil di-train! Halaman akan dimuat ulang...', 'success');
  };

  // Listen for toast events from TrainModelButton
  useEffect(() => {
    const handleToastEvent = (e) => {
      showToast(e.detail.message, e.detail.type);
    };
    window.addEventListener('showToast', handleToastEvent);
    return () => window.removeEventListener('showToast', handleToastEvent);
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
                />
              </div>
              <div className="sm:w-auto">
                <TrainModelButton onTrainComplete={handleModelTrained} />
              </div>
            </div>
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

