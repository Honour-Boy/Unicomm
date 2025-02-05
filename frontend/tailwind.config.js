module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}', './public/index.html'],
  darkMode: 'class', // or 'media' or 'class'
  theme: {
    extend: {
      backgroundImage: {
        "login-pic": "url('/src/assets/loginBackground.jpeg')",
      },
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
};