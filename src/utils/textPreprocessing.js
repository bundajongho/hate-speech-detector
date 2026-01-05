// Text preprocessing utilities
// Note: This is a simplified version for frontend demonstration
// In production, this should be handled by a backend API

export const textCleaning = (text) => {
  if (!text) return '';
  
  let cleaned = text.toLowerCase();
  
  const punctEdges = ".,!?;:\"'()[]{}<>`~|\\/";
  const tokens = cleaned.split(' ');
  const kept = [];
  
  for (const tok of tokens) {
    let core = tok;
    
    // Strip punctuation from edges
    while (core && punctEdges.includes(core[0])) {
      core = core.slice(1);
    }
    while (core && punctEdges.includes(core[core.length - 1])) {
      core = core.slice(0, -1);
    }
    
    if (!core) continue;
    
    // Remove mentions (@username)
    if (core.startsWith('@')) {
      const u = core.slice(1);
      if (u && /^[\w_]+$/.test(u)) {
        continue;
      }
    }
    
    // Remove hashtags (#hashtag)
    if (core.startsWith('#')) {
      const h = core.slice(1);
      if (h && /^[\w_]+$/.test(h)) {
        continue;
      }
    }
    
    // Remove URLs
    if (core.startsWith('http://') || core.startsWith('https://') || core.startsWith('www.')) {
      continue;
    }
    
    kept.push(tok);
  }
  
  cleaned = kept.join(' ');
  
  // Remove non-ASCII characters
  cleaned = cleaned.split('').filter(c => c.charCodeAt(0) < 128).join('');
  
  // Remove numbers
  cleaned = cleaned.replace(/\d+/g, '');
  
  // Keep only alphanumeric, underscore, and spaces
  cleaned = cleaned.split('').filter(c => /[\w\s]/.test(c)).join('');
  
  // Remove extra spaces
  cleaned = cleaned.replace(/\s+/g, ' ').trim();
  
  return cleaned;
};

export const normalizeSlang = (tokens) => {
  if (!tokens || tokens.length === 0) return tokens;
  
  const kamusSlang = {
    'yg': 'yang', 'gk': 'tidak', 'ga': 'tidak', 'tdk': 'tidak',
    'bgt': 'banget', 'dr': 'dari', 'dlm': 'dalam', 'utk': 'untuk',
    'gw': 'saya', 'gue': 'saya', 'lu': 'kamu', 'lo': 'kamu',
    'org': 'orang', 'dg': 'dengan', 'dgn': 'dengan', 'klo': 'kalau',
    'krn': 'karena', 'jg': 'juga', 'sdh': 'sudah', 'udh': 'sudah',
    'blm': 'belum', 'tp': 'tapi', 'sm': 'sama', 'bs': 'bisa',
    'aj': 'saja', 'aja': 'saja', 'bkn': 'bukan', 'hrs': 'harus', 'si': 'sih',
    'kek': 'seperti', 'tu': 'itu', 'ni': 'ini', 'tak': 'tidak', 'dah': 'sudah',
    'makin': 'semakin', 'gak': 'tidak', 'kalo': 'kalau', 'kaya': 'seperti', 'udah': 'sudah',
    'keknya': 'sepertinya', 'emang': 'memang', 'kau': 'kamu'
  };
  
  return tokens.map(token => kamusSlang[token.toLowerCase()] || token);
};

export const removeStopwords = (tokens) => {
  if (!tokens || tokens.length === 0) return tokens;
  
  const stopwords = new Set([
    'yang', 'dan', 'di', 'ke', 'dari', 'untuk', 'adalah', 'dengan', 'para', 
    'itu', 'ini', 'nya', 'pun', 'sih', 'kamu', 'kok', 'kau', 'makin', 
    'kalau', 'kan', 'kst', 'dob', 'lah', 'buat', 'pas', 'jadi', 'apa', 
    'sama', 'beda', 'bukan', 'mau', 'banyak', 'kstp', 'aku', 'iya', 'tau', 
    'pak', 'dulu', 'gua', 'semua', 'mana', 'memang', 'tuh'
  ]);
  
  return tokens.filter(token => !stopwords.has(token.toLowerCase()));
};

export const preprocessText = (text) => {
  if (!text || text.trim() === '') return [];
  
  // Step 1: Text cleaning
  let cleaned = textCleaning(text);
  
  // Step 2: Tokenization
  let tokens = cleaned.split(' ').filter(token => token.length > 0);
  
  // Step 3: Normalize slang
  tokens = normalizeSlang(tokens);
  
  // Step 4: Remove stopwords
  tokens = removeStopwords(tokens);
  
  // Step 5: Simple stemming (basic - in production use proper stemmer)
  // This is a simplified version
  tokens = tokens.map(token => {
    // Basic Indonesian stemming rules
    if (token.endsWith('kan')) return token.slice(0, -3);
    if (token.endsWith('an')) return token.slice(0, -2);
    if (token.endsWith('i')) return token.slice(0, -1);
    return token;
  });
  
  return tokens.filter(token => token.length > 0);
};

// Mock prediction function
// In production, this should call a backend API
export const predictHateSpeech = async (text) => {
  const tokens = preprocessText(text);
  
  // Mock prediction based on keywords
  // This is just for demonstration - real model would use TF-IDF and Naive Bayes
  const textLower = text.toLowerCase();
  
  let netralScore = 0.5;
  let agamaScore = 0.2;
  let rasScore = 0.3;
  
  // Simple keyword-based scoring (mock)
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
  
  // Normalize probabilities
  const total = netralScore + agamaScore + rasScore;
  netralScore /= total;
  agamaScore /= total;
  rasScore /= total;
  
  // Determine label
  let label = 'Netral';
  let classNum = 0;
  
  if (agamaScore > netralScore && agamaScore > rasScore) {
    label = 'Agama';
    classNum = 1;
  } else if (rasScore > netralScore && rasScore > agamaScore) {
    label = 'Ras';
    classNum = 2;
  }
  
  // Add some randomness to make it more realistic
  const probabilities = {
    'Netral': Math.max(0, Math.min(1, netralScore + (Math.random() - 0.5) * 0.1)),
    'Agama': Math.max(0, Math.min(1, agamaScore + (Math.random() - 0.5) * 0.1)),
    'Ras': Math.max(0, Math.min(1, rasScore + (Math.random() - 0.5) * 0.1))
  };
  
  // Normalize again
  const probTotal = probabilities.Netral + probabilities.Agama + probabilities.Ras;
  probabilities.Netral /= probTotal;
  probabilities.Agama /= probTotal;
  probabilities.Ras /= probTotal;
  
  // Re-determine label based on final probabilities
  if (probabilities.Agama > probabilities.Netral && probabilities.Agama > probabilities.Ras) {
    label = 'Agama';
    classNum = 1;
  } else if (probabilities.Ras > probabilities.Netral && probabilities.Ras > probabilities.Agama) {
    label = 'Ras';
    classNum = 2;
  } else {
    label = 'Netral';
    classNum = 0;
  }
  
  return {
    label,
    class: classNum,
    proba: probabilities
  };
};


