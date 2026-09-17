/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#F3EFE4',
        paper: '#15140F',
        surface: '#211F18',
        moss: '#2FBE85',
        clay: '#FFB020',
        line: '#38352A',
        docink: '#1A1917',
        docpaper: '#F6F4EE',
        docaccent: '#1F4B3F',
        docaccent2: '#B4691E'
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
