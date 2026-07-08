/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          light: '#FFE4E1',
          DEFAULT: '#FFB6C1',
          dark: '#FF69B4'
        }
      }
    },
  },
  plugins: [],
}
