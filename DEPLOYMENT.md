# Panduan Deployment

## Opsi 1: Deploy Terpisah (RECOMMENDED)

### Frontend (Vercel)
- Deploy React app ke Vercel
- Update API URL di frontend

### Backend (Railway/Render/Fly.io)

#### **Railway (Paling Mudah)**
1. Buat akun di [railway.app](https://railway.app)
2. New Project → Deploy from GitHub
3. Pilih repo ini
4. Railway akan auto-detect Python dan install dependencies
5. Set start command: `python api/app.py`
6. Railway akan kasih URL public (contoh: `https://your-app.railway.app`)
7. Update frontend untuk call API ini

#### **Render (Gratis)**
1. Buat akun di [render.com](https://render.com)
2. New → Web Service
3. Connect GitHub repo
4. Settings:
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `python api/app.py`
   - Environment: Python 3
5. Render kasih URL public
6. Update frontend

#### **Fly.io**
1. Install flyctl: `curl -L https://fly.io/install.sh | sh`
2. Login: `fly auth login`
3. Init: `fly launch` (dari folder project)
4. Deploy: `fly deploy`
5. Update frontend

### Update Frontend untuk Production

Update `src/components/TrainModelButton.jsx`:

```javascript
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const response = await fetch(`${API_URL}/api/train`, {
  method: 'POST',
  // ...
});
```

Buat file `.env.production`:
```
VITE_API_URL=https://your-backend.railway.app
```

---

## Opsi 2: Vercel Serverless Functions

Convert Flask API ke Vercel Serverless Functions.

### Struktur:
```
api/
  train/
    index.py  # Serverless function untuk /api/train
  model-info/
    index.py  # Serverless function untuk /api/model-info
```

### Contoh `api/train/index.py`:
```python
from http.server import BaseHTTPRequestHandler
import subprocess
import sys
from pathlib import Path

class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        try:
            project_root = Path(__file__).parent.parent.parent
            script_path = project_root / "model" / "train_model.py"
            
            result = subprocess.run(
                [sys.executable, str(script_path)],
                cwd=str(project_root),
                capture_output=True,
                text=True,
                timeout=300
            )
            
            if result.returncode == 0:
                self.send_response(200)
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({
                    'success': True,
                    'message': 'Model trained successfully'
                }).encode())
            else:
                self.send_response(500)
                # ...
        except Exception as e:
            # ...
```

**Note:** Vercel Serverless Functions punya timeout 10 detik (Hobby) atau 60 detik (Pro). Training model mungkin butuh waktu lebih lama, jadi opsi ini kurang cocok.

---

## Opsi 3: Deploy Flask ke Vercel (Eksperimental)

Vercel bisa deploy Python, tapi lebih kompleks. Lebih baik pakai opsi 1.

---

## Rekomendasi

**Gunakan Opsi 1:**
- ✅ Paling mudah dan reliable
- ✅ Backend bisa jalan terus (tidak ada cold start)
- ✅ Timeout lebih panjang untuk training
- ✅ Bisa pakai free tier (Railway/Render)

**Setup:**
1. Deploy backend ke Railway/Render
2. Deploy frontend ke Vercel
3. Update API URL di frontend (pakai environment variable)

---

## Environment Variables

### Frontend (.env.production):
```
VITE_API_URL=https://your-backend.railway.app
```

### Backend (Railway/Render):
```
FLASK_ENV=production
PORT=5000
```

---

## Catatan Penting

1. **CORS**: Pastikan backend allow origin dari Vercel domain
2. **Dataset**: Dataset CSV harus ada di backend server (tidak bisa di Vercel)
3. **Storage**: Model JSON akan tersimpan di backend server
4. **Timeout**: Training bisa lama, pastikan platform support long-running processes

