/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class'],
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './hooks/**/*.{js,ts,jsx,tsx,mdx}',
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      container: { center: true, padding: '1rem', screens: { '2xl': '1280px' } },
      borderRadius: { xl: '1rem', '2xl': '1.25rem' },
    },
  },
  plugins: [], // si tenías 'line-clamp' y Tailwind 3.3+, quítalo
};
