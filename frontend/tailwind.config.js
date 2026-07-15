/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f5f8ff',
          100: '#eaf2ff',
          500: '#4384ec',
          600: '#2f6fd6',
          700: '#255db5',
          900: '#173b70'
        }
      }
    }
  },
  plugins: []
};
