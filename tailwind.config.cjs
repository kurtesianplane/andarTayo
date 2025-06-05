/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      animation: {
        'fade-in': 'fade-in 0.2s ease-out',
        'slide-up': 'slide-up 0.2s ease-out',
        'slide-down': 'slide-down 0.2s ease-out',
        'scale': 'scale 0.2s ease-out',
        'press': 'press 0.1s ease-in-out',
        'pop': 'pop 0.2s ease-out',
        'ripple': 'ripple 0.6s ease-out',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: 0 },
          '100%': { opacity: 1 },
        },
        'slide-up': {
          '0%': { transform: 'translateY(10px)', opacity: 0 },
          '100%': { transform: 'translateY(0)', opacity: 1 },
        },
        'slide-down': {
          '0%': { transform: 'translateY(-10px)', opacity: 0 },
          '100%': { transform: 'translateY(0)', opacity: 1 },
        },
        'scale': {
          '0%': { transform: 'scale(0.98)', opacity: 0 },
          '100%': { transform: 'scale(1)', opacity: 1 },
        },
        'press': {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(0.97)' },
        },
        'pop': {
          '0%': { transform: 'scale(0.95)', opacity: 0 },
          '50%': { transform: 'scale(1.02)' },
          '100%': { transform: 'scale(1)', opacity: 1 },
        },
        'ripple': {
          '0%': { transform: 'scale(0)', opacity: 0.4 },
          '100%': { transform: 'scale(4)', opacity: 0 },
        },
      },
      colors: {
        'ph-blue': {
          '50': '#e6f0ff',
          '100': '#cce0ff',
          '200': '#99c2ff',
          '300': '#66a3ff',
          '400': '#3385ff',
          '500': '#0073FF',
          '600': '#005acc',
          '700': '#004499',
          '800': '#002d66',
          '900': '#001733',
        },
        'ph-red': {
          '50': '#ffe6e6',
          '100': '#ffcccc',
          '200': '#ff9999',
          '300': '#ff6666',
          '400': '#ff3333',
          '500': '#FF0000',
          '600': '#cc0000',
          '700': '#990000',
          '800': '#660000',
          '900': '#330000',
        },
        'ph-yellow': {
          '50': '#fffce6',
          '100': '#fff9cc',
          '200': '#fff399',
          '300': '#ffed66',
          '400': '#ffe733',
          '500': '#FFEB00',
          '600': '#ccbc00',
          '700': '#998d00',
          '800': '#665e00',
          '900': '#332f00',
        },
        'ph-purple': {
          '50': '#f3e8ff',
          '100': '#e5ccff',
          '200': '#cc99ff',
          '300': '#b266ff',
          '400': '#9933ff',
          '500': '#8000FF',
          '600': '#6600cc',
          '700': '#4d0099',
          '800': '#330066',
          '900': '#1a0033',
        },
        neutral: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
        },
      },
      fontFamily: {
        sans: ['Inter var', 'sans-serif'],
      },
    },  },
  plugins: [
    require('tailwind-scrollbar'),
  ],
}