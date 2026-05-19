import type { Config } from "tailwindcss"

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#faf5ff",
          100: "#f3e8ff",
          200: "#e0c4ff",
          300: "#c794ff",
          400: "#af65ff",
          500: "#9b4de6",
          600: "#873ab8",
          700: "#73308d",
          800: "#5f286e",
          900: "#4a1f55",
        },
      },
    },
  },
  plugins: [],
}

export default config