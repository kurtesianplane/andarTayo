/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Plus Jakarta Sans', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
        mono: ['JetBrains Mono', 'SF Mono', 'Consolas', 'monospace'],
      },
      colors: {
        // Transit Line Colors
        lrt1: {
          DEFAULT: '#22C55E',
          dark: '#16A34A',
          light: '#86EFAC',
          bg: '#F0FDF4',
          'bg-dark': '#14532D',
        },
        lrt2: {
          DEFAULT: '#A855F7',
          dark: '#7C3AED',
          light: '#D8B4FE',
          bg: '#FAF5FF',
          'bg-dark': '#581C87',
        },
        mrt3: {
          DEFAULT: '#3B82F6',
          accent: '#FACC15',
          dark: '#1D4ED8',
          light: '#93C5FD',
          bg: '#EFF6FF',
          'bg-dark': '#1E3A8A',
        },
        carousel: {
          DEFAULT: '#EF4444',
          dark: '#DC2626',
          light: '#FCA5A5',
          bg: '#FEF2F2',
          'bg-dark': '#7F1D1D',
        },
        // Neutral Palette
        surface: {
          primary: 'var(--bg-primary)',
          secondary: 'var(--bg-secondary)',
          tertiary: 'var(--bg-tertiary)',
          elevated: 'var(--bg-elevated)',
        },
        content: {
          primary: 'var(--text-primary)',
          secondary: 'var(--text-secondary)',
          tertiary: 'var(--text-tertiary)',
        },
        border: {
          DEFAULT: 'var(--border-default)',
          subtle: 'var(--border-subtle)',
        },
      },
      borderRadius: {
        'xl': '0.75rem',
        '2xl': '1rem',
        '3xl': '1.25rem',
      },
      boxShadow: {
        'glow': '0 0 20px rgb(59 130 246 / 0.15)',
        'glow-lg': '0 0 40px rgb(59 130 246 / 0.2)',
      },
      spacing: {
        'safe-bottom': 'env(safe-area-inset-bottom)',
        'safe-top': 'env(safe-area-inset-top)',
        '18': '4.5rem',
        '22': '5.5rem',
      },
      animation: {
        'slide-up': 'slideUp 200ms ease-out',
        'slide-down': 'slideDown 200ms ease-out',
        'fade-in': 'fadeIn 200ms ease-out',
        'pulse-soft': 'pulseSoft 2s infinite',
        'bounce-subtle': 'bounceSubtle 500ms cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
      keyframes: {
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideDown: {
          '0%': { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        pulseSoft: {
          '0%, 100%': { transform: 'scale(1)', opacity: '1' },
          '50%': { transform: 'scale(1.05)', opacity: '0.9' },
        },
        bounceSubtle: {
          '0%': { transform: 'scale(0.95)' },
          '50%': { transform: 'scale(1.02)' },
          '100%': { transform: 'scale(1)' },
        },
      },
      fontSize: {
        'xxs': ['0.625rem', { lineHeight: '0.875rem' }],
      },
      transitionTimingFunction: {
        'bounce-out': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [
    require('tailwind-scrollbar'),
    // Custom plugin for transit-specific utilities
    function({ addUtilities, addComponents, theme }) {
      addUtilities({
        '.text-balance': {
          'text-wrap': 'balance',
        },
        '.safe-bottom': {
          'padding-bottom': 'env(safe-area-inset-bottom)',
        },
        '.safe-top': {
          'padding-top': 'env(safe-area-inset-top)',
        },
        '.scrollbar-thin': {
          'scrollbar-width': 'thin',
        },
      })
      
      // Line badge components
      addComponents({
        '.line-badge': {
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: `${theme('spacing.1')} ${theme('spacing.3')}`,
          borderRadius: theme('borderRadius.full'),
          fontWeight: '700',
          fontSize: theme('fontSize.xs'),
          letterSpacing: '0.025em',
          textTransform: 'uppercase',
        },
        '.transit-card': {
          backgroundColor: 'var(--bg-primary)',
          border: '1px solid var(--border-subtle)',
          borderRadius: theme('borderRadius.xl'),
          padding: theme('spacing.5'),
          transition: 'all 200ms cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            borderColor: 'var(--border-default)',
            boxShadow: theme('boxShadow.md'),
          },
        },
      })
    },
  ],
}
