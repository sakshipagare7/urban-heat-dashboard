/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#1a56db',
        secondary: '#7c3aed',
        hot: '#ef4444',
        warm: '#f59e0b',
        cool: '#3b82f6',
        cold: '#8b5cf6',
      },
      backgroundColor: {
        dark: '#1a1a2e',
        darkCard: '#16213e',
        darkHover: '#0f3460',
      },
      textColor: {
        dark: '#e2e8f0',
        darkSecondary: '#94a3b8',
      },
      borderColor: {
        dark: '#334155',
      },
    },
  },
  plugins: [],
}