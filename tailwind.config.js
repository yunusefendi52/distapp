/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./components/**/*.{js,vue,ts}",
    "./layouts/**/*.vue",
    "./pages/**/*.vue",
    "./plugins/**/*.{js,ts}",
    "./app.vue",
    "./error.vue",
  ],
  darkMode: ['variant', [
    '&:where(.appdark, .appdark *)',
  ]],
  theme: {
    extend: {},
  },
  plugins: [],
}

