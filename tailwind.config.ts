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
        background: "#F4F5F0",
        surface: "#FFFFFF",
        "surface-warm": "#F9F8F5",
        primary: "#6B8F6D",
        "primary-dark": "#567356",
        accent: "#C4916E",
        "accent-dark": "#A87B57",
        text: "#2C332D",
        "text-muted": "#7C847E",
        border: "#DDE1DA",
        rag: {
          red: "#D94F4F",
          amber: "#D4952A",
          green: "#4D9B6A",
          "red-bg": "#FDF0F0",
          "amber-bg": "#FFF8EB",
          "green-bg": "#EEF6F0",
        },
      },
      fontFamily: {
        serif: ["Instrument Serif", "Georgia", "serif"],
        sans: ["DM Sans", "system-ui", "sans-serif"],
      },
      fontSize: {
        label: ["0.6875rem", { lineHeight: "1", fontWeight: "600", letterSpacing: "0.08em" }],
      },
      letterSpacing: {
        label: "0.08em",
      },
      borderRadius: {
        card: "12px",
      },
      borderWidth: {
        "3": "3px",
      },
      boxShadow: {
        card: "0 1px 3px rgba(44, 51, 45, 0.06), 0 1px 2px rgba(44, 51, 45, 0.04)",
        "card-lg": "0 4px 14px rgba(44, 51, 45, 0.07), 0 2px 4px rgba(44, 51, 45, 0.03)",
        "card-hover": "0 6px 16px rgba(44, 51, 45, 0.09), 0 2px 6px rgba(44, 51, 45, 0.04)",
        "rag-chip": "0 1px 2px rgba(44, 51, 45, 0.10)",
      },
    },
  },
  plugins: [],
};
export default config;
