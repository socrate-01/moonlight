import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Semantic, theme-aware (driven by CSS vars)
        bg: "rgb(var(--bg) / <alpha-value>)",
        surface: "rgb(var(--surface) / <alpha-value>)",
        surface2: "rgb(var(--surface2) / <alpha-value>)",
        fg: "rgb(var(--fg) / <alpha-value>)",
        muted: "rgb(var(--muted) / <alpha-value>)",
        gold: "rgb(var(--gold) / <alpha-value>)",
        accent: "rgb(var(--accent) / <alpha-value>)",
        // Fixed brand colors
        indigo: { plum: "#4b2e8c", deep: "#3a2570" },
        terracotta: { DEFAULT: "#e0632a", deep: "#c8501f" },
        night: { DEFAULT: "#090b1e", 800: "#14173a" },
      },
      fontFamily: {
        display: ["var(--font-display)", "serif"],
        sans: ["var(--font-sans)", "sans-serif"],
      },
      letterSpacing: {
        luxe: "0.42em",
        wide2: "0.24em",
      },
      keyframes: {
        marquee: {
          from: { transform: "translateX(0)" },
          to: { transform: "translateX(-50%)" },
        },
        kenburns: {
          "0%": { transform: "scale(1.05) translate(0, 0)" },
          "100%": { transform: "scale(1.18) translate(-1.5%, -1.5%)" },
        },
        floaty: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        shimmer: {
          "0%, 100%": { opacity: "0.35" },
          "50%": { opacity: "1" },
        },
        drift: {
          "0%, 100%": { transform: "translate(0, 0) scale(1)" },
          "33%": { transform: "translate(4%, -3%) scale(1.08)" },
          "66%": { transform: "translate(-3%, 4%) scale(0.96)" },
        },
        sheen: {
          "0%": { transform: "translateX(-120%)" },
          "100%": { transform: "translateX(120%)" },
        },
      },
      animation: {
        marquee: "marquee 28s linear infinite",
        kenburns: "kenburns 24s ease-in-out infinite alternate",
        floaty: "floaty 8s ease-in-out infinite",
        shimmer: "shimmer 4s ease-in-out infinite",
        drift: "drift 26s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
