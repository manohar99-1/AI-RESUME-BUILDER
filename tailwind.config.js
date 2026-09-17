/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#1A1917',
        paper: '#F6F4EE',
        moss: '#1F4B3F',
        clay: '#B4691E',
        line: '#E1DCCF'
      },
      fontFamily: {
        display: ['"Petrona"', 'serif'],
        body: ['"Work Sans"', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'monospace'],
        docserif: ['"Source Serif 4"', 'Georgia', 'serif']
      }
    },
  },
  plugins: [],
}
