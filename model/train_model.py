"""
Train Hate Speech Detection Model
Rewrite dari notebook 03012026.ipynb
"""

import numpy as np
import pandas as pd
import json
import pickle
from pathlib import Path

# ============================================================================
# TEXT PREPROCESSING
# ============================================================================

def text_cleaning(text: str) -> str:
    """Clean text from social media format"""
    text = text.lower()
    
    punct_edges = ".,!?;:\"'()[]{}<>`~|\\/"
    tokens = text.split()
    kept = []
    
    for tok in tokens:
        core = tok.strip(punct_edges)
        
        if not core:
            continue
        
        # Remove mentions
        if core.startswith("@"):
            u = core[1:]
            if u and all(c.isalnum() or c == "_" for c in u):
                continue
        
        # Remove hashtags
        if core.startswith("#"):
            h = core[1:]
            if h and all(c.isalnum() or c == "_" for c in h):
                continue
        
        # Remove URLs
        if core.startswith(("http://", "https://", "www.")):
            continue
        
        kept.append(tok)
    
    text = " ".join(kept)
    text = "".join(c for c in text if ord(c) < 128)  # Remove non-ASCII
    text = "".join(c for c in text if not c.isdigit())  # Remove numbers
    text = "".join(c for c in text if c.isalnum() or c == "_" or c.isspace())
    text = " ".join(text.split())  # Remove extra spaces
    
    return text


def build_word_freq(text_series):
    """Build word frequency dictionary"""
    freq = {}
    for doc in text_series:
        for w in doc:
            freq[w] = freq.get(w, 0) + 1
    return freq


def edit_distance(a, b):
    """Calculate edit distance between two strings"""
    dp = np.zeros((len(a) + 1, len(b) + 1), dtype=int)
    dp[:, 0] = np.arange(len(a) + 1)
    dp[0, :] = np.arange(len(b) + 1)
    
    for i in range(1, len(a) + 1):
        for j in range(1, len(b) + 1):
            cost = 0 if a[i - 1] == b[j - 1] else 1
            dp[i, j] = min(
                dp[i - 1, j] + 1,
                dp[i, j - 1] + 1,
                dp[i - 1, j - 1] + cost
            )
    return dp[-1, -1]


def correct_word(word, vocab, word_freq, max_dist=2):
    """Correct word spelling using vocabulary"""
    if word in vocab:
        return word
    
    best = word
    best_dist = max_dist + 1
    best_freq = -1
    
    for v in vocab:
        if abs(len(v) - len(word)) > max_dist:
            continue
        d = edit_distance(word, v)
        if d <= max_dist:
            f = word_freq.get(v, 0)
            if (d < best_dist) or (d == best_dist and f > best_freq):
                best = v
                best_dist = d
                best_freq = f
    
    return best


def spelling_correction(tokens, vocab, word_freq, max_dist=2):
    """Apply spelling correction to tokens"""
    return [correct_word(w, vocab, word_freq, max_dist=max_dist) for w in tokens]


def normalize(tokens):
    """Normalize slang words"""
    if tokens is None or (isinstance(tokens, float) and pd.isna(tokens)):
        return tokens
    
    kamus_slang = {
        'yg': 'yang', 'gk': 'tidak', 'ga': 'tidak', 'tdk': 'tidak',
        'bgt': 'banget', 'dr': 'dari', 'dlm': 'dalam', 'utk': 'untuk',
        'gw': 'saya', 'gue': 'saya', 'lu': 'kamu', 'lo': 'kamu',
        'org': 'orang', 'dg': 'dengan', 'dgn': 'dengan', 'klo': 'kalau',
        'krn': 'karena', 'jg': 'juga', 'sdh': 'sudah', 'udh': 'sudah',
        'blm': 'belum', 'tp': 'tapi', 'sm': 'sama', 'bs': 'bisa',
        'aj': 'saja', 'aja': 'saja', 'bkn': 'bukan', 'hrs': 'harus', 'si': 'sih',
        'kek': 'seperti', 'tu': 'itu', 'ni': 'ini', 'tak': 'tidak', 'dah': 'sudah',
        'makin': 'semakin', "gak": "tidak", "kalo": "kalau", "kaya": "seperti", "udah": "sudah",
        "keknya": "sepertinya", "emang": "memang", "kau": "kamu"
    }
    
    return [kamus_slang.get(w, w) for w in tokens]


def remove_stopwords(tokens):
    """Remove stopwords"""
    if tokens is None or (isinstance(tokens, float) and pd.isna(tokens)):
        return tokens
    
    stopwords = {
        "yang", "dan", "di", "ke", "dari", "untuk", "adalah", "dengan", "para",
        "itu", "ini", "nya", "pun", "sih", "kamu", "kok", "kau", "makin",
        "kalau", "kan", "kst", "dob", "lah", "buat", "pas", "jadi", "apa",
        "sama", "beda", "bukan", "mau", "banyak", "kstp", "aku", "iya", "tau",
        "pak", "dulu", "gua", "semua", "mana", "memang", "tuh"
    }
    
    return [w for w in tokens if w not in stopwords]


def stem(tokens):
    """Simple stemming - in production use Sastrawi"""
    if tokens is None or (isinstance(tokens, float) and pd.isna(tokens)):
        return tokens
    
    # Basic Indonesian stemming rules
    stemmed = []
    for w in tokens:
        if w.endswith('kan'):
            stemmed.append(w[:-3])
        elif w.endswith('an'):
            stemmed.append(w[:-2])
        elif w.endswith('i'):
            stemmed.append(w[:-1])
        else:
            stemmed.append(w)
    
    return stemmed


# ============================================================================
# TF-IDF VECTORIZER
# ============================================================================

class TFIDFVectorizer:
    def __init__(self, max_features=None):
        self.max_features = max_features
        self.vocab = {}
        self.idf = None
        self.feature_names = []
        self.n_features = 0
        self.n_docs = 0
    
    def fit(self, docs):
        """Fit vectorizer on documents"""
        self.n_docs = len(docs)
        
        df = {}  # Document frequency
        tf_global = {}  # Global term frequency
        
        for doc in docs:
            if not doc:
                continue
            
            unique_terms = set(doc)
            for term in unique_terms:
                df[term] = df.get(term, 0) + 1
            
            for term in doc:
                tf_global[term] = tf_global.get(term, 0) + 1
        
        if self.max_features is None:
            terms = list(tf_global.keys())
        else:
            terms = sorted(tf_global.keys(),
                          key=lambda t: tf_global[t],
                          reverse=True)[:self.max_features]
        
        self.vocab = {term: idx for idx, term in enumerate(terms)}
        self.feature_names = terms
        self.n_features = len(terms)
        
        N = self.n_docs
        idf_vals = np.zeros(self.n_features, dtype=np.float32)
        for term, idx in self.vocab.items():
            df_t = df.get(term, 0)
            idf_vals[idx] = np.log((N + 1) / (df_t + 1)) + 1.0
        
        self.idf = idf_vals
        return self
    
    def transform(self, docs):
        """Transform documents to TF-IDF matrix"""
        n_samples = len(docs)
        X = np.zeros((n_samples, self.n_features), dtype=np.float32)
        
        for i, doc in enumerate(docs):
            if not doc:
                continue
            doc_len = len(doc)
            
            for term in doc:
                j = self.vocab.get(term)
                if j is not None:
                    X[i, j] += 1.0
            
            if doc_len > 0:
                X[i] /= float(doc_len)
        
        X *= self.idf
        return X
    
    def fit_transform(self, docs):
        """Fit and transform"""
        self.fit(docs)
        return self.transform(docs)
    
    def to_dict(self):
        """Export to dictionary for JavaScript"""
        return {
            'vocab': self.vocab,
            'idf': self.idf.tolist(),
            'feature_names': self.feature_names,
            'n_features': self.n_features,
            'max_features': self.max_features
        }


# ============================================================================
# MULTINOMIAL NAIVE BAYES
# ============================================================================

class MultinomialNB:
    def __init__(self, alpha=1.0):
        self.alpha = float(alpha)
        self.classes_ = None
        self.class_log_prior_ = None
        self.class_count_ = None
        self.feature_count_ = None
        self.feature_prob_ = None
        self.feature_log_prob_ = None
        self.n_features_ = None
    
    def fit(self, X, y):
        """Fit the model"""
        X = np.asarray(X, dtype=np.float64)
        y = np.asarray(y).ravel()
        
        if (X < 0).any():
            raise ValueError("Multinomial Naive Bayes requires non-negative feature values")
        
        self.classes_, y_enc = np.unique(y, return_inverse=True)
        n_samples, n_features = X.shape
        n_classes = self.classes_.size
        self.n_features_ = n_features
        
        self.class_count_ = np.bincount(y_enc, minlength=n_classes).astype(np.float64)
        self.class_log_prior_ = np.log(self.class_count_ / n_samples)
        
        Y_onehot = np.zeros((n_samples, n_classes), dtype=np.float64)
        Y_onehot[np.arange(n_samples), y_enc] = 1.0
        self.feature_count_ = Y_onehot.T @ X
        
        smoothed_fc = self.feature_count_ + self.alpha
        smoothed_total = smoothed_fc.sum(axis=1, keepdims=True)
        
        self.feature_prob_ = smoothed_fc / smoothed_total
        self.feature_log_prob_ = np.log(self.feature_prob_)
        
        return self
    
    def predict_log_proba(self, X):
        """Predict log probabilities"""
        X = np.asarray(X, dtype=np.float64)
        
        if X.shape[1] != self.n_features_:
            raise ValueError(f"Expected {self.n_features_} features, got {X.shape[1]}")
        
        log_likelihood = X @ self.feature_log_prob_.T
        log_joint = log_likelihood + self.class_log_prior_
        
        return log_joint
    
    def predict_proba(self, X):
        """Predict probabilities"""
        log_joint = self.predict_log_proba(X)
        
        log_joint_stable = log_joint - log_joint.max(axis=1, keepdims=True)
        proba = np.exp(log_joint_stable)
        proba /= proba.sum(axis=1, keepdims=True)
        
        return proba
    
    def predict(self, X):
        """Predict classes"""
        log_joint = self.predict_log_proba(X)
        best_indices = np.argmax(log_joint, axis=1)
        return self.classes_[best_indices]
    
    def to_dict(self):
        """Export to dictionary for JavaScript"""
        return {
            'alpha': self.alpha,
            'classes': self.classes_.tolist(),
            'class_log_prior': self.class_log_prior_.tolist(),
            'feature_log_prob': self.feature_log_prob_.tolist(),
            'n_features': self.n_features_
        }


# ============================================================================
# PREPROCESSING PIPELINE
# ============================================================================

def preprocess_text(text, vocab=None, word_freq=None):
    """Complete preprocessing pipeline"""
    # 1. Text cleaning
    cleaned = text_cleaning(text)
    
    # 2. Tokenization
    tokens = cleaned.split()
    tokens = [t for t in tokens if t]
    
    # 3. Spelling correction (if vocab provided)
    if vocab and word_freq:
        tokens = spelling_correction(tokens, vocab, word_freq, max_dist=2)
    
    # 4. Normalize slang
    tokens = normalize(tokens)
    
    # 5. Remove stopwords
    tokens = remove_stopwords(tokens)
    
    # 6. Stemming
    tokens = stem(tokens)
    
    # Filter empty tokens
    tokens = [t for t in tokens if t]
    
    return tokens


# ============================================================================
# TRAIN MODEL
# ============================================================================

def train_model(csv_path="TABEL DATA LATIH HATESPEECH RISET.csv"):
    """Train the model from CSV dataset"""
    print("Loading dataset...")
    dataset = pd.read_csv(csv_path, sep=";", header=None)
    dataset.columns = ["usn", "text", "class"]
    
    print("Cleaning data...")
    # Remove NaN values (handle all columns)
    initial_count = len(dataset)
    dataset = dataset.dropna(subset=['text', 'class'])
    dataset = dataset[dataset['text'].notna() & dataset['class'].notna()]
    
    # Remove duplicates
    dataset = dataset.drop_duplicates(subset=['text', 'class'])
    
    # Remove empty text
    dataset = dataset[dataset['text'].str.strip() != '']
    
    cleaned_count = len(dataset)
    removed_count = initial_count - cleaned_count
    print(f"  Removed {removed_count} rows (NaN/duplicates/empty): {initial_count} -> {cleaned_count}")
    
    print("Preprocessing text...")
    # Text cleaning
    dataset["text"] = dataset["text"].apply(text_cleaning)
    
    # Tokenization
    dataset["text"] = dataset["text"].apply(lambda x: x.split())
    
    # Build vocabulary for spelling correction
    word_freq = build_word_freq(dataset["text"])
    MIN_COUNT = 2
    vocab = {w for w, c in word_freq.items() if c >= MIN_COUNT}
    
    # Spelling correction
    dataset["text"] = dataset["text"].apply(
        lambda x: spelling_correction(x, vocab, word_freq, max_dist=2)
    )
    
    # Normalize
    dataset["text"] = dataset["text"].apply(normalize)
    
    # Remove stopwords
    dataset["text"] = dataset["text"].apply(remove_stopwords)
    
    # Stemming
    dataset["text"] = dataset["text"].apply(stem)
    
    print("Splitting data...")
    # Stratified split
    def stratified_split(data, target, train_size=0.8, seed=42):
        np.random.seed(seed)
        train, test = [], []
        
        for cls in data[target].unique():
            g = data[data[target] == cls].sample(frac=1, random_state=seed)
            s = int(len(g) * train_size)
            train.append(g[:s])
            test.append(g[s:])
        
        return pd.concat(train).reset_index(drop=True), pd.concat(test).reset_index(drop=True)
    
    train, test = stratified_split(dataset, "class")
    
    X_train_text = train["text"].tolist()
    X_test_text = test["text"].tolist()
    y_train = train["class"].tolist()
    y_test = test["class"].tolist()
    
    # Encode target
    map_target = {'Netral': 0, 'Ras': 1, 'Agama': 2}
    reverse = {0: 'Netral', 1: 'Ras', 2: 'Agama'}
    
    y_train = pd.Series(y_train).map(map_target).astype(int).to_numpy()
    y_test = pd.Series(y_test).map(map_target).astype(int).to_numpy()
    
    print("Vectorizing...")
    # TF-IDF Vectorization
    vectorizer = TFIDFVectorizer(max_features=200)
    X_train_tfidf = vectorizer.fit_transform(X_train_text)
    X_test_tfidf = vectorizer.transform(X_test_text)
    
    print("Training model...")
    # Train model
    model = MultinomialNB(alpha=2.0)
    model.fit(X_train_tfidf, y_train)
    
    # Evaluate
    y_pred_train = model.predict(X_train_tfidf)
    y_pred_test = model.predict(X_test_tfidf)
    y_proba_train = model.predict_proba(X_train_tfidf)
    y_proba_test = model.predict_proba(X_test_tfidf)
    
    train_acc = np.mean(y_pred_train == y_train)
    test_acc = np.mean(y_pred_test == y_test)
    
    # Calculate metrics (custom functions like notebook)
    def confusion_matrix(y_true, y_pred, labels=None):
        y_true, y_pred = np.asarray(y_true), np.asarray(y_pred)
        if labels is None:
            labels = np.unique(np.concatenate([y_true, y_pred]))
        cm = np.zeros((len(labels), len(labels)), dtype=int)
        idx = {lab: i for i, lab in enumerate(labels)}
        for t, p in zip(y_true, y_pred):
            cm[idx[t], idx[p]] += 1
        return cm, labels
    
    def precision_recall_f1(y_true, y_pred, average="micro"):
        cm, labels = confusion_matrix(y_true, y_pred)
        tp = np.diag(cm).astype(float)
        fp = cm.sum(axis=0) - tp
        fn = cm.sum(axis=1) - tp
        with np.errstate(divide="ignore", invalid="ignore"):
            prec = np.where(tp+fp == 0, 0, tp/(tp+fp))
            rec = np.where(tp+fn == 0, 0, tp/(tp+fn))
            f1 = np.where(prec+rec == 0, 0, 2*prec*rec/(prec+rec))
        if average == "micro":
            TP, FP, FN = tp.sum(), fp.sum(), fn.sum()
            p = TP/(TP+FP) if TP+FP > 0 else 0
            r = TP/(TP+FN) if TP+FN > 0 else 0
            f = 2*p*r/(p+r) if p+r > 0 else 0
            return p, r, f
        return prec.mean(), rec.mean(), f1.mean()
    
    def roc_auc_score_ovr(y_true, proba, n_thresholds=200):
        y_true = np.asarray(y_true)
        proba = np.asarray(proba, float)
        labels = np.unique(y_true)
        aucs = []
        for k, lab in enumerate(labels):
            y_bin = (y_true == lab).astype(int)
            scores = proba[:, k]
            P = y_bin.sum()
            N = len(y_bin) - P
            tpr, fpr = [], []
            for t in np.linspace(0, 1, n_thresholds):
                pred = scores >= t
                TP = np.sum(pred & (y_bin == 1))
                FP = np.sum(pred & (y_bin == 0))
                tpr.append(TP/P if P else 0)
                fpr.append(FP/N if N else 0)
            order = np.argsort(fpr)
            aucs.append(np.trapz(np.array(tpr)[order], np.array(fpr)[order]))
        return float(np.mean(aucs))
    
    # Training metrics (micro average)
    train_prec, train_rec, train_f1 = precision_recall_f1(y_train, y_pred_train, average="micro")
    train_auc = roc_auc_score_ovr(y_train, y_proba_train)
    
    # Testing metrics (micro average)
    test_prec, test_rec, test_f1 = precision_recall_f1(y_test, y_pred_test, average="micro")
    test_auc = roc_auc_score_ovr(y_test, y_proba_test)
    
    # Cross validation
    def nb_kfold(X, y, alpha=2.0, n_folds=5, random_state=42):
        X = np.asarray(X, dtype=np.float64)
        y = np.asarray(y).ravel()
        n_samples = X.shape[0]
        
        np.random.seed(random_state)
        indices = np.random.permutation(n_samples)
        X_shuffled = X[indices]
        y_shuffled = y[indices]
        
        fold_sizes = np.full(n_folds, n_samples // n_folds, dtype=int)
        fold_sizes[:n_samples % n_folds] += 1
        fold_indices = np.cumsum(np.concatenate([[0], fold_sizes]))
        
        fold_accuracies = np.zeros(n_folds)
        
        for fold in range(n_folds):
            val_start = fold_indices[fold]
            val_end = fold_indices[fold + 1]
            
            val_mask = np.zeros(n_samples, dtype=bool)
            val_mask[val_start:val_end] = True
            
            X_train_cv = X_shuffled[~val_mask]
            y_train_cv = y_shuffled[~val_mask]
            X_val_cv = X_shuffled[val_mask]
            y_val_cv = y_shuffled[val_mask]
            
            model_cv = MultinomialNB(alpha=alpha)
            model_cv.fit(X_train_cv, y_train_cv)
            y_pred_cv = model_cv.predict(X_val_cv)
            
            fold_accuracies[fold] = np.mean(y_val_cv == y_pred_cv)
        
        mean_accuracy = fold_accuracies.mean()
        std_accuracy = fold_accuracies.std()
        return mean_accuracy, std_accuracy
    
    cv_mean, cv_std = nb_kfold(X_train_tfidf, y_train, alpha=2.0, n_folds=5)
    
    print(f"\nTraining Accuracy: {train_acc:.4f}")
    print(f"Testing Accuracy: {test_acc:.4f}")
    print(f"Cross Validation: {cv_mean:.4f} ± {cv_std:.4f}")
    
    # Save model
    output_dir = Path("model")
    output_dir.mkdir(exist_ok=True)
    
    # Also create public directory for web access
    public_dir = Path("public")
    public_dir.mkdir(exist_ok=True)
    
    # Save as pickle
    with open(output_dir / "model.pkl", "wb") as f:
        pickle.dump({
            'model': model,
            'vectorizer': vectorizer,
            'vocab': vocab,
            'word_freq': word_freq,
            'map_target': map_target,
            'reverse': reverse
        }, f)
    
    # Export to JSON for JavaScript
    model_dict = model.to_dict()
    vectorizer_dict = vectorizer.to_dict()
    
    # Get total data count before cleaning
    total_data = initial_count
    
    # Convert numpy arrays to lists for JSON
    export_data = {
        'model': model_dict,
        'vectorizer': vectorizer_dict,
        'vocab': list(vocab),
        'word_freq': {k: int(v) for k, v in word_freq.items()},
        'map_target': map_target,
        'reverse': reverse,
        'training_accuracy': float(train_acc),
        'testing_accuracy': float(test_acc),
        'train_size': len(y_train),
        'test_size': len(y_test),
        'total_data': int(total_data),
        'train_ratio': 0.8,
        'test_ratio': 0.2,
        'alpha': 2.0,
        'max_features': 200,
        'training_metrics': {
            'accuracy': float(train_acc),
            'precision': float(train_prec),
            'recall': float(train_rec),
            'f1': float(train_f1),
            'auc': float(train_auc)
        },
        'testing_metrics': {
            'accuracy': float(test_acc),
            'precision': float(test_prec),
            'recall': float(test_rec),
            'f1': float(test_f1),
            'auc': float(test_auc)
        },
        'cv_metrics': {
            'accuracy': float(cv_mean),
            'std': float(cv_std)
        }
    }
    
    # Save to model directory
    with open(output_dir / "model.json", "w", encoding="utf-8") as f:
        json.dump(export_data, f, indent=2, ensure_ascii=False)
    
    # Also copy to public directory for web access
    with open(public_dir / "model.json", "w", encoding="utf-8") as f:
        json.dump(export_data, f, indent=2, ensure_ascii=False)
    
    print(f"\nModel saved to {output_dir / 'model.pkl'}")
    print(f"Model exported to {output_dir / 'model.json'}")
    print(f"Model copied to {public_dir / 'model.json'} for web access")
    
    return model, vectorizer, vocab, word_freq, map_target, reverse


if __name__ == "__main__":
    # Check if CSV file exists
    csv_path = "TABEL DATA LATIH HATESPEECH RISET.csv"
    
    if not Path(csv_path).exists():
        print(f"Warning: {csv_path} not found!")
        print("Please provide the dataset CSV file.")
        print("\nCreating a minimal model for testing...")
        
        # Create minimal model with dummy data for testing
        # In production, use actual dataset
        print("Note: This will create a basic model structure.")
        print("For full training, provide the CSV file.")
    else:
        train_model(csv_path)

