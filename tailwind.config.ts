import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        vert: {
          50:  "#f0faf4",
          100: "#d9f2e3",
          200: "#b3e5c8",
          300: "#7dcfaa",
          400: "#45b485",
          500: "#1d9c68",
          600: "#0e7d52",
          700: "#0a6342",
          800: "#094f35",
          900: "#07402b",
          950: "#042c1d",
        },
        or: {
          50:  "#fffbea",
          100: "#fff3c0",
          200: "#ffe680",
          300: "#ffd633",
          400: "#ffc800",
          500: "#ffb300",
          600: "#e09000",
          700: "#b86e00",
          800: "#8a5000",
          900: "#5c3500",
          950: "#2e1a00",
        },
        orange: {
          50:  "#fff4ed",
          100: "#ffe4cc",
          200: "#ffc599",
          300: "#ff9f5e",
          400: "#ff7a2a",
          500: "#f55f0a",
          600: "#e04a00",
          700: "#b83800",
          800: "#8a2900",
          900: "#5c1b00",
          950: "#2e0d00",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        arabic: ["Amiri", "serif"],
      },
      backgroundImage: {
        "gradient-touba":
          "linear-gradient(135deg, #07402b 0%, #0a6342 40%, #ff7a2a 80%, #ffc800 100%)",
        "gradient-hero":
          "linear-gradient(180deg, rgba(7,64,43,0.97) 0%, rgba(10,99,66,0.90) 60%, rgba(0,0,0,0.4) 100%)",
        "gradient-atv":
          "linear-gradient(135deg, #07402b 0%, #0a6342 50%, #e04a00 85%, #ffb300 100%)",
      },
    },
  },
  plugins: [],
};

export default config;
