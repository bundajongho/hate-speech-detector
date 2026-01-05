/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Modern professional color palette
        'primary': {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
        'neutral': {
          bg: '#f8fafc',
          card: '#ffffff',
          border: '#e2e8f0',
          text: '#1e293b',
          muted: '#64748b',
        },
        'netral': {
          light: '#10b981',
          DEFAULT: '#059669',
          dark: '#047857',
        },
        'agama': {
          light: '#ef4444',
          DEFAULT: '#dc2626',
          dark: '#b91c1c',
        },
        'ras': {
          light: '#f59e0b',
          DEFAULT: '#d97706',
          dark: '#b45309',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'scale-in': 'scaleIn 0.3s ease-out',
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(0, 0, 0, 0.08), 0 8px 24px -4px rgba(0, 0, 0, 0.06)',
        'medium': '0 8px 32px -4px rgba(0, 0, 0, 0.12), 0 12px 40px -6px rgba(0, 0, 0, 0.08)',
        'large': '0 12px 48px -6px rgba(0, 0, 0, 0.18), 0 16px 64px -8px rgba(0, 0, 0, 0.12)',
        '2xl': '0 20px 60px -8px rgba(0, 0, 0, 0.25), 0 24px 80px -12px rgba(0, 0, 0, 0.15)',
      },
    },
  },
  plugins: [],
}

