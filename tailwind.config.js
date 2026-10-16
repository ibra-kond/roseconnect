/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      // Trois couleurs principales : #863146 (plum-700), #F26ABC (pink-500), #D7A0B9 (mauve-300).
      // Les autres teintes en sont dérivées (fonds clairs, survols, texte au contraste AA).
      colors: {
        plum: { 50: '#FBF2F5', 100: '#F5E1E8', 200: '#EAC3D1', 500: '#A84A63', 700: '#863146', 800: '#6B2638', 900: '#4A1626' },
        pink: { 50: '#FEF1F8', 100: '#FCDDEF', 300: '#F79BD1', 500: '#F26ABC', 600: '#E04FA8', 700: '#C2398C' },
        mauve: { 50: '#FAF3F6', 100: '#F3E3EA', 200: '#E9CDDA', 300: '#D7A0B9', 500: '#B87C98', 700: '#7D4862', 800: '#643950' },
        cream: '#FFF7FA',
        ink: { DEFAULT: '#2D1720', muted: '#6E5762' },
        warning: { DEFAULT: '#B45309', 50: '#FEF6E7' },
        line: '#EED9E3',
      },
      fontFamily: {
        heading: ['Nunito', 'system-ui', 'sans-serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        sm: ['0.875rem', { lineHeight: '1.45' }],
        base: ['1.0625rem', { lineHeight: '1.5' }],
        lg: ['1.25rem', { lineHeight: '1.4' }],
        xl: ['1.5rem', { lineHeight: '1.3' }],
        '2xl': ['1.875rem', { lineHeight: '1.2' }],
      },
      borderRadius: { card: '16px', pill: '999px' },
      boxShadow: {
        soft: '0 4px 16px rgba(31,41,51,.06)',
        lift: '0 8px 28px rgba(31,41,51,.10)',
      },
      maxWidth: { app: '480px' },
      spacing: { tap: '48px' },
    },
  },
  plugins: [],
};
