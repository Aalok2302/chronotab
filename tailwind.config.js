/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        'chrome-blue': '#1a73e8',
        'chrome-gray': '#5f6368',
      }
    },
  },
  plugins: [],
}