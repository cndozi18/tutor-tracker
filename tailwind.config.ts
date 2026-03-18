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
        background: "#FAF8F4",
        surface: "#FFFFFF",
        primary: "#1A6B5C",
        "primary-dark": "#145549",
        accent: "#E8863A",
        "accent-dark": "#D4722A",
        text: "#1C1917",
        "text-muted": "#78716C",
        border: "#E7E5E0",
        rag: {
          red: "#DC2626",
          amber: "#D97706",
          green: "#16A34A",
          "red-bg": "#FEF2F2",
          "amber-bg": "#FFFBEB",
          "green-bg": "#F0FDF4",
        },
      },
      fontFamily: {
        serif: ["Instrument Serif", "Georgia", "serif"],
        sans: ["DM Sans", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 3px rgba(28, 25, 23, 0.08), 0 1px 2px rgba(28, 25, 23, 0.04)",
        "card-lg": "0 4px 12px rgba(28, 25, 23, 0.08), 0 2px 4px rgba(28, 25, 23, 0.04)",
        "rag-chip": "0 1px 2px rgba(28, 25, 23, 0.12)",
      },
    },
  },
  plugins: [],
};
export default config;
