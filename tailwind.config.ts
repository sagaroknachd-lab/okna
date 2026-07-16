import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        brand: {
          50: "#eefdf6",
          100: "#d6f9e8",
          200: "#b0f1d3",
          300: "#7be4b8",
          400: "#41cf97",
          500: "#18b57c",
          600: "#0a9264",
          700: "#097552",
          800: "#0b5d43",
          900: "#0a4c39",
          950: "#022b20",
        },
        ink: {
          50: "#f6f7f9",
          100: "#eceef2",
          200: "#d5d9e2",
          300: "#b0b8c8",
          400: "#8591a8",
          500: "#66738c",
          600: "#515c73",
          700: "#424a5e",
          800: "#3a4050",
          900: "#0f1729",
          950: "#080d18",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(15,23,41,0.04), 0 8px 24px -12px rgba(15,23,41,0.12)",
      },
    },
  },
  plugins: [],
};
export default config;
