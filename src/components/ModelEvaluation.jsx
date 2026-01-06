import React, { useState, useEffect } from 'react';

const ModelEvaluation = () => {
  const [modelInfo, setModelInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadModelInfo();
  }, []);

  const loadModelInfo = async () => {
    setIsLoading(true);
    try {
      // Try to fetch from API first, fallback to local file
      const API_URL = import.meta.env.VITE_API_URL || '';
      let response;
      let data;
      
      if (API_URL) {
        // Fetch from API
        response = await fetch(`${API_URL}/api/model-info`);
        if (response.ok) {
          const apiData = await response.json();
          if (apiData.success && apiData.data) {
            data = apiData.data; // API returns {success: true, data: {...}}
          } else {
            throw new Error('API returned invalid data');
          }
        } else {
          throw new Error('API not available');
        }
      } else {
        // Fallback to local file
        response = await fetch('/model.json');
        if (response.ok) {
          data = await response.json();
        } else {
          throw new Error('Model file not found');
        }
      }

      setModelInfo({
        name: 'Multinomial Naive Bayes',
        alpha: data.alpha || 2.0,
        totalData: data.total_data || 0,
        trainSize: data.train_size || 0,
        testSize: data.test_size || 0,
        trainRatio: data.train_ratio || 0.8,
        testRatio: data.test_ratio || 0.2,
        features: data.vectorizer?.max_features || data.vectorizer?.n_features || data.max_features || 200,
        vectorizer: 'TF-IDF',
        trainingMetrics: data.training_metrics || {
          accuracy: data.training_accuracy || 0,
          precision: data.training_precision || 0,
          recall: data.training_recall || 0,
          f1: data.training_f1 || 0,
          auc: data.training_auc || 0
        },
        testingMetrics: data.testing_metrics || {
          accuracy: data.testing_accuracy || 0,
          precision: data.testing_precision || 0,
          recall: data.testing_recall || 0,
          f1: data.testing_f1 || 0,
          auc: data.testing_auc || 0
        },
        cvMetrics: data.cv_metrics || {
          accuracy: data.cv_accuracy || 0,
          std: data.cv_std || 0
        }
      });
    } catch (error) {
      console.error('Error loading model info:', error);
      // Fallback to default values if model.json not found
      setModelInfo({
        name: 'Multinomial Naive Bayes',
        alpha: 2.0,
        totalData: 2000,
        trainSize: 1564,
        testSize: 393,
        trainRatio: 0.8,
        testRatio: 0.2,
        features: 200,
        vectorizer: 'TF-IDF',
        trainingMetrics: {
          accuracy: 0.7174,
          precision: 0.7174,
          recall: 0.7174,
          f1: 0.7174,
          auc: 0.8740
        },
        testingMetrics: {
          accuracy: 0.6590,
          precision: 0.6590,
          recall: 0.6590,
          f1: 0.6590,
          auc: 0.8122
        },
        cvMetrics: {
          accuracy: 0.6247,
          std: 0.0268
        }
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Listen for model training completion
  useEffect(() => {
    const handleModelTrained = () => {
      loadModelInfo();
    };
    window.addEventListener('modelTrained', handleModelTrained);
    return () => window.removeEventListener('modelTrained', handleModelTrained);
  }, []);

  if (isLoading || !modelInfo) {
    return (
      <div className="card p-6 md:p-8 animate-scale-in">
        <div className="flex items-center justify-center py-12">
          <svg className="animate-spin h-8 w-8 text-primary-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      </div>
    );
  }

  const formatPercentage = (value) => {
    return (value * 100).toFixed(2) + '%';
  };

  const getAccuracyColor = (accuracy) => {
    if (accuracy >= 0.7) return 'text-netral';
    if (accuracy >= 0.6) return 'text-ras';
    return 'text-agama';
  };

  const getMetricBadgeColor = (value) => {
    if (value >= 0.7) return 'bg-netral/10 border-netral-light/30 text-netral';
    if (value >= 0.6) return 'bg-ras-light/10 border-ras-light/30 text-ras';
    return 'bg-agama-light/10 border-agama-light/30 text-agama';
  };

  return (
    <div className="card p-6 md:p-8 animate-scale-in">
      <div className="flex items-center gap-2 mb-6">
        <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1V6h-1m4 0h.01M19 6v.01M19 12v.01M19 18v.01M12 6v.01M12 12v.01M12 18v.01M6 6v.01M6 12v.01M6 18v.01M4 2h16a2 2 0 012 2v16a2 2 0 01-2 2H4a2 2 0 01-2-2V4a2 2 0 012-2z" />
        </svg>
        <h3 className="text-lg md:text-xl font-bold text-neutral-text">Informasi Model & Evaluasi</h3>
      </div>

      <div className="space-y-6">
        {/* Model Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="p-5 rounded-2xl bg-white/40 backdrop-blur-2xl border border-white/40 shadow-large relative overflow-hidden group hover:bg-white/50 transition-all duration-500">
            {/* Subtle glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary-100/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10"></div>
            <div className="flex items-center gap-2 mb-3">
              <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              <span className="font-semibold text-neutral-text">Model</span>
            </div>
            <p className="text-lg font-bold text-primary-700">{modelInfo.name}</p>
            <p className="text-sm text-neutral-muted mt-1">Alpha: {modelInfo.alpha}</p>
          </div>

          <div className="p-5 rounded-2xl bg-white/40 backdrop-blur-2xl border border-white/40 shadow-large relative overflow-hidden group hover:bg-white/50 transition-all duration-500">
            {/* Subtle glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary-100/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10"></div>
            <div className="flex items-center gap-2 mb-2">
              <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
              </svg>
              <span className="font-semibold text-neutral-text">Vectorizer</span>
            </div>
            <p className="text-lg font-bold text-primary-700">{modelInfo.vectorizer}</p>
            <p className="text-sm text-neutral-muted mt-1">{modelInfo.features} features</p>
          </div>
        </div>

        {/* Dataset Information */}
        <div className="p-6 rounded-2xl bg-white/40 backdrop-blur-2xl border border-white/40 shadow-large">
          <h4 className="font-semibold text-neutral-text mb-3 flex items-center gap-2">
            <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
            </svg>
            Informasi Dataset
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-xs text-neutral-muted mb-1">Total Data</p>
              <p className="text-lg font-bold text-neutral-text">{modelInfo.totalData.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-xs text-neutral-muted mb-1">Training</p>
              <p className="text-lg font-bold text-primary-600">{modelInfo.trainSize.toLocaleString()}</p>
              <p className="text-xs text-neutral-muted">({formatPercentage(modelInfo.trainRatio)})</p>
            </div>
            <div>
              <p className="text-xs text-neutral-muted mb-1">Testing</p>
              <p className="text-lg font-bold text-primary-600">{modelInfo.testSize.toLocaleString()}</p>
              <p className="text-xs text-neutral-muted">({formatPercentage(modelInfo.testRatio)})</p>
            </div>
            <div>
              <p className="text-xs text-neutral-muted mb-1">Rasio</p>
              <p className="text-lg font-bold text-neutral-text">{modelInfo.trainRatio * 100}:{modelInfo.testRatio * 100}</p>
            </div>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="space-y-4">
          <h4 className="font-semibold text-neutral-text flex items-center gap-2">
            <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
            Metrik Performa
          </h4>

          {/* Training Metrics */}
          <div className="p-6 rounded-2xl border border-white/40 bg-white/40 backdrop-blur-2xl shadow-large relative overflow-hidden">
            {/* Subtle gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary-50/30 via-transparent to-blue-50/20 -z-10"></div>
            <div className="flex items-center justify-between mb-3">
              <h5 className="font-semibold text-neutral-text">Training Set</h5>
              <span className={`text-lg font-bold ${getAccuracyColor(modelInfo.trainingMetrics.accuracy)}`}>
                {formatPercentage(modelInfo.trainingMetrics.accuracy)}
              </span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className={`p-4 rounded-xl border backdrop-blur-xl relative overflow-hidden group hover:scale-105 transition-all duration-300 ${getMetricBadgeColor(modelInfo.trainingMetrics.precision)}`}>
                <p className="text-xs text-neutral-muted mb-1.5">Precision</p>
                <p className="text-base font-bold">{formatPercentage(modelInfo.trainingMetrics.precision)}</p>
              </div>
              <div className={`p-4 rounded-xl border backdrop-blur-xl relative overflow-hidden group hover:scale-105 transition-all duration-300 ${getMetricBadgeColor(modelInfo.trainingMetrics.recall)}`}>
                <p className="text-xs text-neutral-muted mb-1.5">Recall</p>
                <p className="text-base font-bold">{formatPercentage(modelInfo.trainingMetrics.recall)}</p>
              </div>
              <div className={`p-4 rounded-xl border backdrop-blur-xl relative overflow-hidden group hover:scale-105 transition-all duration-300 ${getMetricBadgeColor(modelInfo.trainingMetrics.f1)}`}>
                <p className="text-xs text-neutral-muted mb-1.5">F1-Score</p>
                <p className="text-base font-bold">{formatPercentage(modelInfo.trainingMetrics.f1)}</p>
              </div>
              <div className={`p-4 rounded-xl border backdrop-blur-xl relative overflow-hidden group hover:scale-105 transition-all duration-300 ${getMetricBadgeColor(modelInfo.trainingMetrics.auc)}`}>
                <p className="text-xs text-neutral-muted mb-1">AUC-ROC</p>
                <p className="text-sm font-bold">{formatPercentage(modelInfo.trainingMetrics.auc)}</p>
              </div>
            </div>
          </div>

          {/* Testing Metrics */}
          <div className="p-6 rounded-2xl border border-white/40 bg-white/40 backdrop-blur-2xl shadow-large relative overflow-hidden">
            {/* Subtle gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary-50/30 via-transparent to-blue-50/20 -z-10"></div>
            <div className="flex items-center justify-between mb-3">
              <h5 className="font-semibold text-neutral-text">Testing Set</h5>
              <span className={`text-lg font-bold ${getAccuracyColor(modelInfo.testingMetrics.accuracy)}`}>
                {formatPercentage(modelInfo.testingMetrics.accuracy)}
              </span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className={`p-4 rounded-xl border backdrop-blur-xl relative overflow-hidden group hover:scale-105 transition-all duration-300 ${getMetricBadgeColor(modelInfo.testingMetrics.precision)}`}>
                <p className="text-xs text-neutral-muted mb-1.5">Precision</p>
                <p className="text-base font-bold">{formatPercentage(modelInfo.testingMetrics.precision)}</p>
              </div>
              <div className={`p-4 rounded-xl border backdrop-blur-xl relative overflow-hidden group hover:scale-105 transition-all duration-300 ${getMetricBadgeColor(modelInfo.testingMetrics.recall)}`}>
                <p className="text-xs text-neutral-muted mb-1.5">Recall</p>
                <p className="text-base font-bold">{formatPercentage(modelInfo.testingMetrics.recall)}</p>
              </div>
              <div className={`p-4 rounded-xl border backdrop-blur-xl relative overflow-hidden group hover:scale-105 transition-all duration-300 ${getMetricBadgeColor(modelInfo.testingMetrics.f1)}`}>
                <p className="text-xs text-neutral-muted mb-1.5">F1-Score</p>
                <p className="text-base font-bold">{formatPercentage(modelInfo.testingMetrics.f1)}</p>
              </div>
              <div className={`p-4 rounded-xl border backdrop-blur-xl relative overflow-hidden group hover:scale-105 transition-all duration-300 ${getMetricBadgeColor(modelInfo.testingMetrics.auc)}`}>
                <p className="text-xs text-neutral-muted mb-1">AUC-ROC</p>
                <p className="text-sm font-bold">{formatPercentage(modelInfo.testingMetrics.auc)}</p>
              </div>
            </div>
          </div>

          {/* Cross Validation */}
          <div className="p-6 rounded-2xl border border-white/40 bg-white/40 backdrop-blur-2xl shadow-large relative overflow-hidden">
            {/* Subtle gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary-50/30 via-transparent to-blue-50/20 -z-10"></div>
            <div className="flex items-center justify-between mb-2">
              <h5 className="font-semibold text-neutral-text flex items-center gap-2">
                <svg className="w-4 h-4 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Cross Validation (5-Fold)
              </h5>
              <span className={`text-lg font-bold ${getAccuracyColor(modelInfo.cvMetrics.accuracy)}`}>
                {formatPercentage(modelInfo.cvMetrics.accuracy)} ± {formatPercentage(modelInfo.cvMetrics.std)}
              </span>
            </div>
            <p className="text-xs text-neutral-muted">
              Mean accuracy dengan standard deviation dari 5-fold cross validation
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModelEvaluation;

