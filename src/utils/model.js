// Model implementation in JavaScript
// This will load the model from model.json exported from Python

let modelData = null;
let modelLoaded = false;

// Load model from JSON file
export const loadModel = async () => {
  if (modelLoaded && modelData) {
    return modelData;
  }

  try {
    // Try to load from public directory first
    const response = await fetch('/model.json');
    if (!response.ok) {
      throw new Error('Failed to load model');
    }
    modelData = await response.json();
    modelLoaded = true;
    console.log('Model loaded successfully from /model.json');
    return modelData;
  } catch (error) {
    console.warn('Model file not found, using mock prediction:', error.message);
    console.warn('To use the real model, run: python model/train_model.py');
    // Fallback to mock model
    return null;
  }
};

// TF-IDF Vectorizer in JavaScript
class TFIDFVectorizerJS {
  constructor(config) {
    this.vocab = config.vocab;
    this.idf = config.idf;
    this.feature_names = config.feature_names;
    this.n_features = config.n_features;
  }

  transform(docs) {
    const n_samples = docs.length;
    const X = Array(n_samples).fill(null).map(() => Array(this.n_features).fill(0));

    for (let i = 0; i < n_samples; i++) {
      const doc = docs[i];
      if (!doc || doc.length === 0) continue;

      const doc_len = doc.length;

      // Count term frequency
      for (const term of doc) {
        const j = this.vocab[term];
        if (j !== undefined) {
          X[i][j] += 1.0;
        }
      }

      // Normalize by document length
      if (doc_len > 0) {
        for (let j = 0; j < this.n_features; j++) {
          X[i][j] /= doc_len;
        }
      }

      // Multiply by IDF
      for (let j = 0; j < this.n_features; j++) {
        X[i][j] *= this.idf[j];
      }
    }

    return X;
  }
}

// Multinomial Naive Bayes in JavaScript
class MultinomialNBJS {
  constructor(config) {
    this.alpha = config.alpha;
    this.classes = config.classes;
    this.class_log_prior = config.class_log_prior;
    this.feature_log_prob = config.feature_log_prob;
    this.n_features = config.n_features;
  }

  predictLogProba(X) {
    const n_samples = X.length;
    const n_classes = this.classes.length;
    const log_joint = Array(n_samples).fill(null).map(() => Array(n_classes).fill(0));

    for (let i = 0; i < n_samples; i++) {
      for (let c = 0; c < n_classes; c++) {
        let log_likelihood = 0;
        for (let j = 0; j < this.n_features; j++) {
          log_likelihood += X[i][j] * this.feature_log_prob[c][j];
        }
        log_joint[i][c] = log_likelihood + this.class_log_prior[c];
      }
    }

    return log_joint;
  }

  predictProba(X) {
    const log_joint = this.predictLogProba(X);
    const n_samples = log_joint.length;
    const n_classes = this.classes.length;
    const proba = Array(n_samples).fill(null).map(() => Array(n_classes).fill(0));

    for (let i = 0; i < n_samples; i++) {
      // Find max for numerical stability
      const max_log = Math.max(...log_joint[i]);
      
      // Calculate exp(log_joint - max) for stability
      let sum = 0;
      for (let c = 0; c < n_classes; c++) {
        proba[i][c] = Math.exp(log_joint[i][c] - max_log);
        sum += proba[i][c];
      }

      // Normalize
      for (let c = 0; c < n_classes; c++) {
        proba[i][c] /= sum;
      }
    }

    return proba;
  }

  predict(X) {
    const log_joint = this.predictLogProba(X);
    const predictions = [];

    for (let i = 0; i < log_joint.length; i++) {
      const best_idx = log_joint[i].indexOf(Math.max(...log_joint[i]));
      predictions.push(this.classes[best_idx]);
    }

    return predictions;
  }
}

// Edit distance for spelling correction
function editDistance(a, b) {
  const dp = Array(a.length + 1).fill(null).map(() => Array(b.length + 1).fill(0));
  
  for (let i = 0; i <= a.length; i++) dp[i][0] = i;
  for (let j = 0; j <= b.length; j++) dp[0][j] = j;
  
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + cost
      );
    }
  }
  
  return dp[a.length][b.length];
}

// Correct word spelling
function correctWord(word, vocab, wordFreq, maxDist = 2) {
  if (vocab.has(word)) {
    return word;
  }

  let best = word;
  let bestDist = maxDist + 1;
  let bestFreq = -1;

  for (const v of vocab) {
    if (Math.abs(v.length - word.length) > maxDist) continue;
    
    const d = editDistance(word, v);
    if (d <= maxDist) {
      const f = wordFreq.get(v) || 0;
      if (d < bestDist || (d === bestDist && f > bestFreq)) {
        best = v;
        bestDist = d;
        bestFreq = f;
      }
    }
  }

  return best;
}

// Spelling correction
function spellingCorrection(tokens, vocab, wordFreq, maxDist = 2) {
  return tokens.map(w => correctWord(w, vocab, wordFreq, maxDist));
}

// Export prediction function
export const predictHateSpeech = async (text) => {
  // Load model if not loaded
  const data = await loadModel();
  
  if (!data) {
    // Fallback to mock prediction
    console.warn('Model not loaded, using mock prediction');
    return predictMock(text);
  }

  // Preprocess text (using functions from textPreprocessing.js)
  const { preprocessText } = await import('./textPreprocessing.js');
  let tokens = preprocessText(text);

  // Apply spelling correction if vocab available
  if (data.vocab && data.word_freq) {
    const vocab = new Set(data.vocab);
    const wordFreq = new Map(Object.entries(data.word_freq));
    tokens = spellingCorrection(tokens, vocab, wordFreq, 2);
  }

  // Initialize vectorizer and model
  const vectorizer = new TFIDFVectorizerJS(data.vectorizer);
  const model = new MultinomialNBJS(data.model);

  // Transform and predict
  const X = vectorizer.transform([tokens]);
  const proba = model.predictProba(X)[0];
  const pred = model.predict(X)[0];

  // Map to labels - reverse mapping: 0=Netral, 1=Ras, 2=Agama
  const reverse = data.reverse;
  // Handle both string and number keys
  const label = reverse[pred] || reverse[String(pred)];

  // Map probabilities based on class order from model
  // model.classes = [0, 1, 2] means: proba[0]=class 0, proba[1]=class 1, proba[2]=class 2
  // reverse mapping: 0=Netral, 1=Ras, 2=Agama
  const probabilities = {};
  let maxProb = -1;
  let finalLabel = label;
  
  // Map each probability to its corresponding label
  for (let i = 0; i < model.classes.length; i++) {
    const classNum = model.classes[i];
    const classLabel = reverse[classNum] || reverse[String(classNum)];
    const prob = proba[i];
    probabilities[classLabel] = prob;
    
    // Find the label with highest probability
    if (prob > maxProb) {
      maxProb = prob;
      finalLabel = classLabel;
    }
  }

  // Use the label with highest probability (not the predicted class)
  // This ensures consistency between displayed label and probability bars
  return {
    label: finalLabel,
    class: pred,
    proba: probabilities
  };
};

// Mock prediction fallback
function predictMock(text) {
  const textLower = text.toLowerCase();
  let netralScore = 0.5;
  let agamaScore = 0.2;
  let rasScore = 0.3;

  const agamaKeywords = ['agama', 'islam', 'kristen', 'hindu', 'buddha', 'kafir', 'murtad'];
  const rasKeywords = ['ras', 'etnis', 'cina', 'jawa', 'sunda', 'batak', 'rasis'];

  const agamaMatches = agamaKeywords.filter(kw => textLower.includes(kw)).length;
  const rasMatches = rasKeywords.filter(kw => textLower.includes(kw)).length;

  if (agamaMatches > 0) {
    agamaScore = 0.6 + (agamaMatches * 0.1);
    netralScore = 0.2;
    rasScore = 0.2;
  }

  if (rasMatches > 0) {
    rasScore = 0.6 + (rasMatches * 0.1);
    netralScore = 0.2;
    agamaScore = 0.2;
  }

  const total = netralScore + agamaScore + rasScore;
  netralScore /= total;
  agamaScore /= total;
  rasScore /= total;

  let label = 'Netral';
  let classNum = 0;

  if (agamaScore > netralScore && agamaScore > rasScore) {
    label = 'Agama';
    classNum = 1;
  } else if (rasScore > netralScore && rasScore > agamaScore) {
    label = 'Ras';
    classNum = 2;
  }

  const probabilities = {
    'Netral': netralScore,
    'Agama': agamaScore,
    'Ras': rasScore
  };

  return {
    label,
    class: classNum,
    proba: probabilities
  };
}

