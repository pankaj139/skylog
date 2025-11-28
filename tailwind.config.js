/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'dark-bg': '#0a0e27',
        'dark-surface': '#1a1f40',
        'dark-border': '#2d3561',
        'neon-blue': '#00f0ff',
        'neon-cyan': '#00ffff',
        'neon-purple': '#b794f4',
        'neon-pink': '#ff006e',
      },
      boxShadow: {
        'neon': '0 0 20px rgba(0, 240, 255, 0.3)',
        'neon-strong': '0 0 30px rgba(0, 240, 255, 0.5)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [],
}

