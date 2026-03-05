import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        surface: {
          DEFAULT: "#0f1117",
          secondary: "#151823",
          tertiary: "#1c1f2e",
          hover: "#242838",
        },
        accent: {
          DEFAULT: "#6366f1",
          hover: "#818cf8",
        },
        gain: "#22c55e",
        loss: "#ef4444",
        muted: "#64748b",
        border: "#1e293b",
      },
      fontFamily: {
        mono: ["JetBrains Mono", "Fira Code", "monospace"],
      },
    },
  },
  plugins: [],
} satisfies Config;
