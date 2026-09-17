/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#ECEEF1',
        paper: '#10141A',
        surface: '#1A2028',
        moss: '#22B8A6',
        clay: '#E3AE4E',
        line: '#2B323B',
        docink: '#1A1917',
        docpaper: '#F6F4EE',
        docaccent: '#1F4B3F',
        docaccent2: '#B4691E'
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'sans-serif'],
        body: ['"Work Sans"', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'monospace'],
        docserif: ['"Source Serif 4"', 'Georgia', 'serif']
      }
    },
  },
  plugins: [],
}
