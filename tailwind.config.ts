/** @type {import('tailwindcss').Config} */
module.exports = {
  theme: {
    extend: {
      fontFamily: {
        // This 'marker' key allows you to use 'font-marker' in your classes
        marker: ["var(--font-permanent-marker)"],
      },
    },
  },
  plugins: [],
};
