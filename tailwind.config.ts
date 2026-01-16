import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        serif: ['var(--font-lora)', 'Georgia', 'serif'],
      },
      colors: {
        threads: {
          bg: '#101010',
          card: '#181818',
          border: '#333333',
          text: '#f5f5f5',
          secondary: '#777777',
          muted: '#555555',
        },
      },
    },
  },
  plugins: [],
}
export default config
