/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './App.tsx',
    './src/components/**/*.{js,jsx,ts,tsx}',
    './src/screens/**/*.{js,jsx,ts,tsx}',
    './src/navigation/**/*.{js,jsx,ts,tsx}',
    './src/context/**/*.{js,jsx,ts,tsx}',
    './index.ts',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      fontFamily: {
        playfair: ['PlayfairDisplay'],
        'playfair-italic': ['PlayfairDisplay-Italic'],
      },
      backgroundColor: {
        'dark-primary': '#121212',

        'light-primary': '#FFFFFF',
      },
      textColor: {
        'dark-text-primary': '#FFFFFF',
        'light-text-primary': '#000000',
      },
      borderColor: {
        'dark-border-primary': '#333333',
        'light-border-primary': '#E5E5E5',
      },
    },
  },
  plugins: [],
};
