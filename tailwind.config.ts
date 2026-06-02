import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui"],
      },
      colors: {
        brand: "#1a73e8",
        sidebar: "#0f2044",
      },
      boxShadow: {
        card: "0 16px 36px rgba(15, 23, 42, 0.08)",
        soft: "0 8px 22px rgba(15, 23, 42, 0.06)",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        scaleUp: {
          "0%": { transform: "scale(0.95)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        slideInRight: {
          "0%": { transform: "translateX(100%)" },
          "100%": { transform: "translateX(0)" },
        },
        slideInBottom: {
          "0%": { transform: "translateY(100%)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
      },
      animation: {
        "fade-in": "fadeIn 0.2s ease-out forwards",
        "scale-up": "scaleUp 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "slide-in-right": "slideInRight 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "slide-in-bottom": "slideInBottom 0.2s ease-out forwards",
      },
    },
  },
  plugins: [],
} satisfies Config;
