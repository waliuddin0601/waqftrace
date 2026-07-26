/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: ["class"],
  theme: {
    extend: {
      colors: {
        surface: "var(--surface-1)",
        page: "var(--page-plane)",
        ink: "var(--text-primary)",
        "ink-secondary": "var(--text-secondary)",
        "ink-muted": "var(--text-muted)",
        gridline: "var(--gridline)",
        baseline: "var(--baseline)",
        series1: "rgb(var(--series-1-rgb) / <alpha-value>)",
        series2: "rgb(var(--series-2-rgb) / <alpha-value>)",
        series3: "rgb(var(--series-3-rgb) / <alpha-value>)",
        series4: "rgb(var(--series-4-rgb) / <alpha-value>)",
        series5: "rgb(var(--series-5-rgb) / <alpha-value>)",
        series6: "rgb(var(--series-6-rgb) / <alpha-value>)",
        series7: "rgb(var(--series-7-rgb) / <alpha-value>)",
        series8: "rgb(var(--series-8-rgb) / <alpha-value>)",
        good: "rgb(var(--status-good-rgb) / <alpha-value>)",
        warning: "rgb(var(--status-warning-rgb) / <alpha-value>)",
        serious: "rgb(var(--status-serious-rgb) / <alpha-value>)",
        critical: "rgb(var(--status-critical-rgb) / <alpha-value>)",
      },
      fontFamily: {
        sans: ["system-ui", "-apple-system", "Segoe UI", "sans-serif"],
      },
    },
  },
  plugins: [],
};
