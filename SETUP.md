# Setup Instructions

## Instalasi

1. Install dependencies:
```bash
npm install
```

2. Jalankan development server:
```bash
npm run dev
```

## Struktur File

- `src/App.jsx` - Main application component
- `src/components/` - All React components
- `src/utils/textPreprocessing.js` - Text preprocessing utilities
- `tailwind.config.js` - Tailwind CSS configuration
- `postcss.config.js` - PostCSS configuration
- `vite.config.js` - Vite configuration

## Warna Tema

- **Primary**: Biru (#0ea5e9)
- **Netral**: Hijau (#059669)
- **Agama**: Merah (#dc2626)
- **Ras**: Orange (#d97706)
- **Neutral**: Gray scale untuk background dan text

## Troubleshooting

Jika ada error:
1. Pastikan semua dependencies sudah terinstall: `npm install`
2. Hapus node_modules dan install ulang: `rm -rf node_modules && npm install`
3. Pastikan port 5173 tidak digunakan aplikasi lain

