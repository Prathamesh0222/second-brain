/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gray: {
          100: "#fefffe",
          200:"#f8fafc",
          600: "#545560"
        },
        purple: {
          200: "#e1e7fe",
          500: "#5149b9",
          600: "#5047e5"
        }
      }
    },
  },
  plugins: [],
}
