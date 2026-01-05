# Setup API untuk Train Model

## Cara Menjalankan API

1. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

2. **Jalankan Flask API:**
   ```bash
   python api/app.py
   ```

   API akan berjalan di `http://localhost:5000`

3. **Pastikan dataset CSV ada:**
   - File `TABEL DATA LATIH HATESPEECH RISET.csv` harus ada di root directory
   - Format: `usn;text;class` (separator: semicolon)

## Endpoints

### POST `/api/train`
Train model dari web
- **Response:**
  ```json
  {
    "success": true,
    "message": "Model trained successfully",
    "output": "..."
  }
  ```

### GET `/api/model-info`
Get informasi model dari model.json
- **Response:**
  ```json
  {
    "success": true,
    "data": { ... }
  }
  ```

## Catatan

- API akan menjalankan `model/train_model.py` saat tombol "Train Model" diklik
- Model akan otomatis di-export ke `model/model.json` dan `public/model.json`
- Web akan otomatis reload setelah training selesai untuk load model baru

