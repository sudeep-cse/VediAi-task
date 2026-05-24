import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        canvas: '#F4F4F3',
        card: '#FFFFFF',
        ink: {
          DEFAULT: '#18181B',
          soft: '#3F3F46',
          muted: '#71717A',
          faint: '#A1A1AA',
        },
        line: '#E7E7E5',
        accent: {
          DEFAULT: '#F2541B',
          soft: '#FEEAE0',
          ring: '#FF6A36',
        },
        easy: '#16A34A',
        moderate: '#D97706',
        hard: '#DC2626',
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        serif: ['var(--font-serif)', 'Georgia', 'serif'],
      },
      borderRadius: {
        xl: '0.875rem',
        '2xl': '1.25rem',
      },
      boxShadow: {
        card: '0 1px 2px rgba(16,24,40,0.04), 0 1px 3px rgba(16,24,40,0.06)',
        soft: '0 4px 24px rgba(16,24,40,0.06)',
        glow: '0 0 0 1px #FF6A36, 0 8px 24px rgba(242,84,27,0.25)',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.4s ease-out both',
        shimmer: 'shimmer 1.6s infinite',
      },
    },
  },
  plugins: [],
};

export default config;
