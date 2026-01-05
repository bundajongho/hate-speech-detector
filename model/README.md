# Model Training

File Python untuk train model hate speech detection dari notebook.

## Cara Menggunakan

1. **Siapkan Dataset**
   - Letakkan file CSV dataset di root project dengan nama: `TABEL DATA LATIH HATESPEECH RISET.csv`
   - Format CSV: `usn;text;class` (separator: semicolon)

2. **Install Dependencies**
   ```bash
   pip install numpy pandas
   ```

3. **Train Model**
   ```bash
   python model/train_model.py
   ```

4. **Hasil Training**
   - `model/model.pkl` - Model dalam format pickle (untuk Python)
   - `model/model.json` - Model dalam format JSON (untuk JavaScript/web)

5. **Copy Model ke Public Directory**
   ```bash
   # Copy model.json ke public folder agar bisa diakses oleh web
   cp model/model.json public/model.json
   ```

## Struktur Model

Model yang dihasilkan berisi:
- **TF-IDF Vectorizer**: Vocabulary, IDF values, feature names
- **Multinomial Naive Bayes**: Class priors, feature probabilities
- **Preprocessing vocab**: Vocabulary untuk spelling correction
- **Mapping**: Target encoding (Netral: 0, Ras: 1, Agama: 2)

## Testing

Untuk test prediksi menggunakan model:
```bash
python model/predict.py
```

