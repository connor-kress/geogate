/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all of your component files.
  content: [
    "./index.{js,jsx,ts,tsx}",    // Index file
    "./global.css",               // Global CSS file
    "./src/**/*.{js,jsx,ts,tsx}", // All files in the `src` folder
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {},
  },
  plugins: [],
}
