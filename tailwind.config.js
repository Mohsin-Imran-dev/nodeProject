/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./views/*.{html, ejs}"],
  theme: {
    extend: {
      boxShadow: {
        'custom': '0 4px 8px rgba(0,230,200,0.4)',
      }
    }
  },
  plugins: []
}
