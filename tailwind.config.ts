import type { Config } from "tailwindcss";

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
          DEFAULT: "#f97316",
          dark: "#ea580c",
          light: "#fdba74",
        },
        background: "#ffffff",
        foreground: "#0f172a",
        muted: {
          DEFAULT: "#f1f5f9",
          foreground: "#64748b",
        },
        border: "#e2e8f0",
        success: {
          DEFAULT: "#22c55e",
          light: "#dcfce7",
        },
        warning: {
          DEFAULT: "#f59e0b",
          light: "#fef3c7",
        },
        danger: {
          DEFAULT: "#ef4444",
          light: "#fee2e2",
        },
        info: {
          DEFAULT: "#3b82f6",
          light: "#dbeafe",
        },
      },
    },
  },
  plugins: [],
};

export default config;
