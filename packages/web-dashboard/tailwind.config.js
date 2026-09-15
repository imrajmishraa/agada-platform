/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#f0f9ff',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
        },
        risk: {
          low:      '#16a34a',
          medium:   '#f59e0b',
          high:     '#dc2626',
          critical: '#7f1d1d',
        },
      },
    },
  },
  plugins: [],
};
