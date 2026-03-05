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
        // ── Pixel art palette ──────────────────────────────
        pixel: {
          bg:      "#b8bdd9", // lavender background
          bg2:     "#d0d4ee", // lighter lavender
          pink:    "#f0b4ca", // machine body
          pink2:   "#e2789e", // darker pink / accent
          pink3:   "#fce4ef", // very light pink
          purple:  "#7b7fc4", // dome / window
          purple2: "#5457a0", // darker purple
          dark:    "#3d1a35", // outlines / main text
          dark2:   "#251030", // deep shadow
          light:   "#fef0f8", // near-white
          yellow:  "#ffd93d", // coin / accent
          mint:    "#6fcf97", // success / capsule
        },
        // ── Legacy cozy palette ────────────────────────────
        cream:    { 50:"#fefef9", 100:"#fdf8ef", 200:"#f9efd9" },
        blush:    { 100:"#fde8e8", 200:"#fbc5c5", 300:"#f89898", 400:"#f06b6b" },
        mint:     { 100:"#d6f5ee", 200:"#a8e9d8", 300:"#72d9bf" },
        lavender: { 100:"#ede8f9", 200:"#d4c9f5", 300:"#b9a7ef" },
        peach:    { 100:"#fdeede", 200:"#fbd7b6", 300:"#f7bc8a" },
        sky:      { 100:"#dff0fc", 200:"#b8dff8", 300:"#87c9f4" },
        warm:     { 50:"#faf9f7", 100:"#f5f2ec", 200:"#e8e0d0", 800:"#5c4f3a", 900:"#3d3326" },
      },
      fontFamily: {
        sans:    ["var(--font-nunito)", "system-ui", "sans-serif"],
        display: ["var(--font-nunito)", "system-ui", "sans-serif"],
        pixel:   ["var(--font-pixel)",  "monospace"],
      },
      borderRadius: {
        "4xl": "2rem",
        "5xl": "2.5rem",
      },
      keyframes: {
        "capsule-drop": {
          "0%":   { transform: "translateY(-70px)", opacity: "0" },
          "60%":  { transform: "translateY(6px)",   opacity: "1" },
          "80%":  { transform: "translateY(-3px)" },
          "100%": { transform: "translateY(0)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%":      { transform: "translateY(-6px)" },
        },
        blink: {
          "0%, 100%": { opacity: "1" },
          "50%":      { opacity: "0" },
        },
        "pixel-shake": {
          "0%, 100%": { transform: "translateX(0)" },
          "25%":      { transform: "translateX(-3px)" },
          "75%":      { transform: "translateX(3px)" },
        },
      },
      animation: {
        "capsule-drop": "capsule-drop 0.55s cubic-bezier(0.34,1.56,0.64,1)",
        float:          "float 3.5s ease-in-out infinite",
        blink:          "blink 1s step-end infinite",
        "pixel-shake":  "pixel-shake 0.3s ease-in-out",
      },
      boxShadow: {
        pixel:        "4px 4px 0 0 #3d1a35",
        "pixel-sm":   "2px 2px 0 0 #3d1a35",
        "pixel-lg":   "6px 6px 0 0 #3d1a35",
        "pixel-inset":"inset 2px 2px 0 0 rgba(255,255,255,0.3), inset -2px -2px 0 0 rgba(0,0,0,0.15)",
        cozy:         "0 4px 20px rgba(0,0,0,0.06), 0 1px 4px rgba(0,0,0,0.04)",
        "cozy-lg":    "0 8px 40px rgba(0,0,0,0.08), 0 2px 8px rgba(0,0,0,0.04)",
        capsule:      "inset 0 2px 8px rgba(255,255,255,0.4), 0 4px 16px rgba(0,0,0,0.12)",
      },
      borderWidth: { "3": "3px" },
    },
  },
  plugins: [],
};

export default config;
