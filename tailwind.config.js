/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#12241f',
        paper: '#f6f4ee',
        surface: '#ffffff',
        line: '#dfe3d8',
        brand: {
          50: '#eef7f1',
          100: '#d7ecdd',
          200: '#aed9bb',
          300: '#7fc099',
          400: '#4d9f75',
          500: '#2f7d58',
          600: '#236446',
          700: '#1c4f38',
          800: '#173f2d',
          900: '#123024',
        },
        clay: '#c1622e',
        amber: '#c9932f',
        rose: '#b1483f',
      },
      fontFamily: {
        display: ['"Fraunces"', 'serif'],
        body: ['"Inter"', 'system-ui', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'monospace'],
      },
      boxShadow: {
        card: '0 1px 2px rgba(18,36,31,0.06), 0 8px 24px -12px rgba(18,36,31,0.12)',
      },
      borderRadius: {
        card: '14px',
      },
    },
  },
  plugins: [],
}
