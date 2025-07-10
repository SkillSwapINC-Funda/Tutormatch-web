import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#c92020',
        'primary-hover': '#a51b1b',
        secondary: '#b41c1c',
        dark: '#1f1f1f',
        'dark-light': '#2a2a2a',
        'dark-card': '#2f2f2f',
        'dark-border': '#3f3f3f',
        light: '#ffffff',
        'light-gray': '#a0a0a0',
      },
    },
  },
  plugins: [tailwindcssAnimate],
} satisfies Config;