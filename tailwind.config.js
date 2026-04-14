/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          900: "#0b0d12",
          800: "#13151c",
          700: "#1c1f28",
          600: "#262a36",
          500: "#353a48",
          400: "#5a6070",
          300: "#8890a2",
          200: "#c2c7d2",
          100: "#e5e8ef",
          50: "#f6f7fa",
        },
        accent: {
          500: "#5b8cff",
          600: "#3d6ae6",
          700: "#2e52bf",
        },
        signal: {
          red: "#e4525c",
          amber: "#e2a23d",
          green: "#37a97c",
          blue: "#3d84e6",
        },
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "-apple-system", "Segoe UI", "Roboto", "Helvetica", "Arial", "sans-serif"],
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
      },
      fontSize: {
        xs: ["0.75rem", "1.1rem"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(10,14,22,0.05), 0 8px 24px -12px rgba(10,14,22,0.15)",
      },
    },
  },
  plugins: [],
}
