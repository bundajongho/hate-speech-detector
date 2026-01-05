# Setup Model untuk Web

## Penjelasan Implementasi

Saya telah membuat file Python yang **rewrite model dari notebook** dan memastikan model bisa digunakan di web.

### File yang Dibuat:

1. **`model/train_model.py`** - File Python untuk train model
   - Rewrite semua fungsi dari notebook (text_cleaning, normalize, remove, stem)
   - TF-IDF Vectorizer class
   - Multinomial Naive Bayes class
   - Training pipeline lengkap
   - Export model ke JSON untuk JavaScript

2. **`model/predict.py`** - Script untuk test prediksi
   - Load model yang sudah di-train
   - Test prediksi dengan beberapa contoh

3. **`src/utils/model.js`** - Implementasi model di JavaScript
   - Load model dari JSON
   - TF-IDF Vectorizer di JavaScript
   - Multinomial Naive Bayes di JavaScript
   - Prediction function

## Cara Menggunakan:

### 1. Train Model (Python)
```bash
# Install dependencies
pip install numpy pandas

# Train model (pastikan CSV file ada di root)
python model/train_model.py
```

Ini akan menghasilkan:
- `model/model.pkl` - Model untuk Python
- `model/model.json` - Model untuk JavaScript
- `public/model.json` - Copy untuk web (otomatis)

### 2. Web akan otomatis load model
- Web akan mencoba load `/model.json` dari public directory
- Jika model.json ada, akan menggunakan model yang sebenarnya
- Jika tidak ada, akan fallback ke mock prediction

### 3. Model yang digunakan
- **Sama persis dengan notebook**: Alpha=2.0, max_features=200
- **Preprocessing sama**: text_cleaning, normalize, remove, stem
- **TF-IDF dan Naive Bayes**: Implementasi sama dengan notebook

## Perbedaan dengan Notebook:

1. **Format Export**: Model di-export ke JSON agar bisa digunakan di JavaScript
2. **Preprocessing**: Sama persis dengan notebook, tapi di-rewrite untuk Python standalone
3. **Model Implementation**: Di JavaScript, model di-implement ulang sesuai dengan algoritma dari notebook

## Status:

✅ Model Python sudah dibuat dan siap untuk di-train
✅ Model JavaScript sudah siap untuk load dan predict
✅ Web sudah di-update untuk menggunakan model yang sebenarnya
✅ Fallback ke mock jika model belum di-train

## Next Steps:

1. Run `python model/train_model.py` untuk train model
2. Model akan otomatis di-copy ke `public/model.json`
3. Web akan otomatis menggunakan model yang sebenarnya

