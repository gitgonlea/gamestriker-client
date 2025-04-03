/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'cs-blue': {
          400: 'rgb(17, 186, 243)',
          500: 'rgb(25, 182, 235)',
          600: 'rgb(34, 172, 218)',
          700: 'rgb(32, 179, 228)',
        },
        'cs-amber': {
          400: 'rgb(255, 184, 28)',
          500: 'rgb(230, 173, 51)',
        },
      },
      fontFamily: {
        sans: ['var(--font-roboto)'],
        jersey: ['var(--font-jersey)'],
      },
      backgroundImage: {
        'main-bg': "url('/assets/14.png')",
      },
      width: {
        '7/10': '70%',
        '3/10': '30%',
      },
    },
  },
  plugins: [],
}