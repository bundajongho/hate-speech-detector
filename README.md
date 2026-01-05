# Hate Speech Detector Web Application

Aplikasi web modern untuk mendeteksi hate speech menggunakan React JS dan Tailwind CSS dengan desain yang canggih, interaktif, dan responsif.

## ✨ Fitur Utama

### 🎨 Desain Modern & Profesional
- **Glassmorphism Effects**: Efek kaca modern dengan backdrop blur
- **Gradient Backgrounds**: Background gradient yang dinamis dan menarik
- **Animated Elements**: Animasi smooth pada semua elemen interaktif
- **Responsive Design**: Tampilan optimal di semua perangkat (mobile, tablet, desktop)

### 🚀 Fitur Interaktif
- **Real-time Character Counter**: Menampilkan jumlah karakter saat mengetik
- **Focus Indicators**: Visual feedback saat input aktif
- **Loading Animations**: Spinner animasi saat proses analisis
- **Hover Effects**: Efek hover yang smooth pada semua tombol dan card
- **Smooth Transitions**: Transisi animasi pada semua perubahan state

### 📊 Visualisasi Data
- **Animated Progress Bars**: Progress bar dengan animasi gradient
- **Color-coded Results**: Hasil dengan warna berbeda untuk setiap kategori
- **Confidence Indicators**: Menampilkan tingkat kepercayaan prediksi
- **Sorted Probabilities**: Probabilitas diurutkan dari tertinggi ke terendah

### 🎯 Komponen yang Ditingkatkan

#### Header
- Gradient background dengan efek shimmer
- Icon animasi dengan pulse effect
- Decorative elements untuk depth

#### Input Area
- Glassmorphism card design
- Focus ring dengan glow effect
- Character counter real-time
- Helper text dengan icon

#### Buttons
- Gradient buttons dengan shimmer effect
- Loading state dengan spinner
- Scale animations pada hover/click
- Icon animations

#### Result Display
- Color-coded badges dengan gradient
- Icon untuk setiap kategori
- Confidence percentage display
- Smooth fade-in animations

#### Probability Bars
- Animated progress bars dengan gradient
- Shimmer effect pada bar
- Highest probability highlighting
- Total confidence summary

## 🛠️ Instalasi

1. Install dependencies:
```bash
npm install
```

2. Jalankan development server:
```bash
npm run dev
```

3. Build untuk production:
```bash
npm run build
```

4. Preview production build:
```bash
npm run preview
```

## 📁 Struktur Komponen

```
src/
├── components/
│   ├── Header.jsx          # Header dengan gradient dan animasi
│   ├── InputArea.jsx        # Input area dengan glassmorphism
│   ├── ButtonGroup.jsx      # Tombol dengan efek interaktif
│   ├── ResultDisplay.jsx    # Display hasil dengan badges
│   ├── ProbabilityBars.jsx # Progress bars animasi
│   └── Footer.jsx           # Footer dengan branding
├── utils/
│   └── textPreprocessing.js # Utility untuk preprocessing text
├── App.jsx                  # Main app component
├── main.jsx                 # Entry point
└── index.css                # Global styles & animations
```

## 🎨 Teknologi & Tools

- **React 18**: UI library modern
- **Tailwind CSS 3**: Utility-first CSS framework
- **Vite**: Build tool yang cepat
- **Custom Animations**: CSS animations dan transitions

## 🎭 Fitur Animasi

- **Slide In**: Animasi masuk dari bawah
- **Fade In**: Fade in effect
- **Scale In**: Scale animation
- **Float**: Floating animation
- **Pulse**: Pulse effect
- **Shimmer**: Shimmer effect pada gradients
- **Smooth Transitions**: Transisi halus pada semua interaksi

## 📱 Responsive Breakpoints

- **Mobile**: < 640px
- **Tablet**: 640px - 1024px
- **Desktop**: > 1024px

## 🎨 Color Scheme

- **Background**: Dark theme (#1e1e2e)
- **Cards**: Glassmorphism dengan backdrop blur
- **Netral**: Green (#27ae60)
- **Agama**: Red (#e74c3c)
- **Ras**: Orange (#f39c12)
- **Primary Button**: Pink/Red gradient (#e94560)

## ⚠️ Catatan Penting

Aplikasi ini menggunakan **mock prediction** untuk demonstrasi. Untuk implementasi production, diperlukan:
- Backend API yang menghubungkan dengan model machine learning
- Model Multinomial Naive Bayes yang sudah di-train
- TF-IDF vectorizer yang sesuai dengan model

## 🚀 Performance

- Optimized dengan Vite untuk build cepat
- Code splitting otomatis
- Lazy loading untuk komponen besar
- CSS purging untuk bundle size minimal

## 📝 License

Copyright © 2025 Asta Production. All rights reserved.

