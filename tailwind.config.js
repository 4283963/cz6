/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
    },
    extend: {
      colors: {
        bg: {
          primary: "#0a0a0f",
          secondary: "#1a1a2e",
          tertiary: "#121220",
          card: "rgba(26, 26, 46, 0.7)",
        },
        neon: {
          green: "#00ff9d",
          red: "#ff3b5c",
          gold: "#ffb800",
          purple: "#6c5ce7",
          blue: "#00d4ff",
        },
      },
      fontFamily: {
        display: ['"Space Grotesk"', "sans-serif"],
        mono: ['"JetBrains Mono"', "ui-monospace", "monospace"],
        sans: ['"Inter"', "system-ui", "sans-serif"],
      },
      boxShadow: {
        "neon-green": "0 0 20px rgba(0, 255, 157, 0.3), 0 0 40px rgba(0, 255, 157, 0.1)",
        "neon-red": "0 0 20px rgba(255, 59, 92, 0.3), 0 0 40px rgba(255, 59, 92, 0.1)",
        "neon-gold": "0 0 20px rgba(255, 184, 0, 0.4), 0 0 40px rgba(255, 184, 0, 0.2)",
        "neon-purple": "0 0 20px rgba(108, 92, 231, 0.3), 0 0 40px rgba(108, 92, 231, 0.1)",
      },
      animation: {
        "pulse-glow": "pulseGlow 2s ease-in-out infinite",
        "scan-line": "scanLine 3s linear infinite",
        "tick-flash": "tickFlash 0.6s ease-out",
      },
      keyframes: {
        pulseGlow: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.6" },
        },
        scanLine: {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(100%)" },
        },
        tickFlash: {
          "0%": { backgroundColor: "rgba(0, 255, 157, 0.2)" },
          "100%": { backgroundColor: "transparent" },
        },
      },
    },
  },
  plugins: [],
};
