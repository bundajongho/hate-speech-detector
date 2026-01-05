"""
Prediction script using trained model
"""

import pickle
import json
import numpy as np
from pathlib import Path
from train_model import preprocess_text, TFIDFVectorizer, MultinomialNB

def load_model(model_path="model/model.pkl"):
    """Load trained model"""
    with open(model_path, "rb") as f:
        data = pickle.load(f)
    return data

def predict_text(text, model_data):
    """Predict hate speech from text"""
    model = model_data['model']
    vectorizer = model_data['vectorizer']
    vocab = model_data['vocab']
    word_freq = model_data['word_freq']
    reverse = model_data['reverse']
    
    # Preprocess
    tokens = preprocess_text(text, vocab, word_freq)
    
    # Vectorize
    X = vectorizer.transform([tokens])
    
    # Predict
    pred = model.predict(X)[0]
    proba = model.predict_proba(X)[0]
    
    # Map to labels
    label = reverse[pred]
    probabilities = {
        'Netral': float(proba[0]),
        'Agama': float(proba[1]),
        'Ras': float(proba[2])
    }
    
    return {
        'label': label,
        'class': int(pred),
        'proba': probabilities
    }

if __name__ == "__main__":
    # Test prediction
    model_data = load_model()
    
    test_texts = [
        "Saya suka makan nasi goreng",
        "Agama itu penting untuk kehidupan",
        "Semua ras manusia sama derajatnya"
    ]
    
    print("Testing predictions:")
    print("=" * 50)
    for text in test_texts:
        result = predict_text(text, model_data)
        print(f"\nText: {text}")
        print(f"Label: {result['label']}")
        print(f"Probabilities: {result['proba']}")

