/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: { 50: '#eff6ff', 100: '#dbeafe', 500: '#3b82f6', 600: '#2563eb', 700: '#1d4ed8', 900: '#1e3a8a' },
        accent: { 400: '#f59e0b', 500: '#f97316' },
        success: '#10b981',
        danger: '#ef4444',
        dark: { 800: '#1f2937', 900: '#111827' }
      },
      fontFamily: { sans: ['Inter', 'sans-serif'] }
    }
  },
  plugins: []
}
