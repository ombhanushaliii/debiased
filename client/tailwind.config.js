/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        paper: {
          50: '#fefefe',
          100: '#f8f7f5',
          200: '#f1f0ed',
          300: '#e8e6e1',
          400: '#ddd9d2',
          500: '#cfc9be',
          600: '#b5aca0',
          700: '#968b7d',
          800: '#776e63',
          900: '#5a544d',
        },
        ink: {
          50: '#f7f7f6',
          100: '#e8e7e4',
          200: '#d1cfca',
          300: '#b7b3ab',
          400: '#9c958a',
          500: '#85796d',
          600: '#6b6057',
          700: '#564c43',
          800: '#453c35',
          900: '#39312b',
        }
      },
      fontFamily: {
        'sans': ['Inter', 'system-ui', 'sans-serif'],
        'paper': ['Georgia', 'Times New Roman', 'serif'],
      },
      boxShadow: {
        'paper': '0 2px 8px rgba(0, 0, 0, 0.06), 0 1px 3px rgba(0, 0, 0, 0.1)',
        'paper-lg': '0 8px 32px rgba(0, 0, 0, 0.08), 0 4px 16px rgba(0, 0, 0, 0.1)',
        'paper-xl': '0 16px 64px rgba(0, 0, 0, 0.1), 0 8px 32px rgba(0, 0, 0, 0.12)',
      },
      borderRadius: {
        'paper': '12px',
        'paper-lg': '16px',
        'paper-xl': '20px',
      },
      backgroundImage: {
        'paper-texture': 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'60\' height=\'60\' viewBox=\'0 0 60 60\'%3E%3Cg fill-opacity=\'0.02\'%3E%3Cpolygon fill=\'%23000\' points=\'36 34 26 24 16 34\'/%3E%3C/g%3E%3C/svg%3E")',
      }
    },
  },
  plugins: [],
}