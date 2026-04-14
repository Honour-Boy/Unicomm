/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}", "./public/index.html"],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        sans: [
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
      },
      colors: {
        uni: {
          bg: "#0F172A",
          surface: "#1E293B",
          surface2: "#273449",
          border: "#1f2a44",
          muted: "#94A3B8",
          text: "#E2E8F0",
          accent: "#6366F1",
          accent2: "#8B5CF6",
          online: "#22C55E",
        },
      },
      backgroundImage: {
        "login-pic": "url('/src/assets/loginBackground.jpeg')",
        "bubble-sent":
          "linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)",
      },
      boxShadow: {
        bubble: "0 2px 10px rgba(99, 102, 241, 0.15)",
      },
      keyframes: {
        "fade-in-up": {
          "0%": { opacity: "0", transform: "translateY(6px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "slide-in-right": {
          "0%": { opacity: "0", transform: "translateX(10px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        "slide-in-left": {
          "0%": { opacity: "0", transform: "translateX(-10px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        pulseDot: {
          "0%, 100%": { opacity: "0.4" },
          "50%": { opacity: "1" },
        },
      },
      animation: {
        "fade-in-up": "fade-in-up 240ms ease-out both",
        "slide-in-right": "slide-in-right 220ms ease-out both",
        "slide-in-left": "slide-in-left 220ms ease-out both",
        "pulse-dot": "pulseDot 1.2s ease-in-out infinite",
      },
    },
  },
  variants: { extend: {} },
  plugins: [],
};
