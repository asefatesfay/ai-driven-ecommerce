import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      colors: {
        nordstrom: {
          black: "#000000",
          white: "#ffffff",
          gray: {
            50: "#f9f9f9",
            100: "#f2f2f2",
            200: "#e5e5e5",
            300: "#cccccc",
            500: "#888888",
            700: "#444444",
            900: "#1a1a1a",
          },
          gold: "#C8A951",
          star: "#C8A951",
          cream: "#faf8f5",
        },
      },
      letterSpacing: {
        widest: "0.2em",
      },
    },
  },
  plugins: [],
};

export default config;
