/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          '"Pretendard Variable"',
          'Pretendard',
          '-apple-system',
          'BlinkMacSystemFont',
          'system-ui',
          'Roboto',
          '"Helvetica Neue"',
          'Arial',
          '"Noto Sans"',
          'sans-serif',
        ],
        noto: ['"Noto Sans KR"', 'sans-serif'],
        display: ['"Black Han Sans"', 'sans-serif'],
      },
      colors: {
        'jeju-blue': {
          light: '#E3F2FD',
          DEFAULT: '#1E88E5',
          dark: '#0D47A1',
        },
        'jeju-orange': {
          light: '#FFF3E0',
          DEFAULT: '#FF9800',
          dark: '#E65100',
        },
        'jeju-stone': {
          light: '#EFEBE9',
          DEFAULT: '#8D6E63',
          dark: '#4E342E',
        },
        bread: {
          light: '#FFF8E1',
          crust: '#D4A76A',
          brown: '#A87C4F',
        },
      },
      backgroundImage: {
        'jeju-pattern': "url('/src/assets/images/jeju-pattern.png')",
      },
      boxShadow: {
        soft: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        hover:
          '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      },
      borderRadius: {
        xl: '1rem',
        '2xl': '1.5rem',
      },
      zIndex: {
        60: '60',
        70: '70',
        80: '80',
        90: '90',
        100: '100',
      },
    },
  },
  plugins: [],
}
