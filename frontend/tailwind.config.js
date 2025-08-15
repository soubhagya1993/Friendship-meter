// frontend/tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // Updated colors to match the Figma design system
      colors: {
        'primary-teal': '#4DB6AC',
        'light-teal': '#E6F3F2',
        'background-beige': '#fef1e1',
        'card-beige': '#FFFDFA',
        'border-soft': '#F3EEE8',
        'text-primary': '#3D475C',
        'text-secondary': '#8A94A6',
        'pill-red-bg': '#FEE2E2',
        'pill-red-text': '#DC2626',
      },
      fontFamily: {
        'nunito': ['Nunito', 'sans-serif'],
        'inter': ['Inter', 'sans-serif'],
      },
      // Updated border radius to be consistent
      borderRadius: {
        'lg': '0.5rem', // 8px
        'xl': '0.75rem', // 12px
      }
    },
  },
  plugins: [],
}