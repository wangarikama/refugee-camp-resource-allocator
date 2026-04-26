/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'un-blue': '#418FDE', // Official United Nations Blue
      }
    },
  },
  plugins: [],
}