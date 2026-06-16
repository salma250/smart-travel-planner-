/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
    './pages/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f7fbff',
          100: '#eef6ff',
          200: '#d9ecff',
          500: '#3b82f6'
        },
        smarttravel: {
          primary: '#6366f1',
          accent: '#f59e0b',
          darkbg: '#0f172a',
          carddark: '#1e293b'
        }
      },
      borderRadius: {
        '2xl': '1rem'
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'Segoe UI', 'Helvetica', 'Arial']
      },
      boxShadow: {
        subtle: '0 8px 30px rgba(16,24,40,0.08)'
      }
    },
  },
  plugins: [],
}
