/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // macOS-inspired colors
        "macos-blue": "#007AFF",
        "macos-green": "#34C759",
        "macos-red": "#FF3B30",
        "macos-orange": "#FF9500",
        "macos-yellow": "#FFCC00",
        "macos-purple": "#AF52DE",
        "macos-gray": {
          50: "#F9F9F9",
          100: "#F0F0F0",
          200: "#E5E5E5",
          300: "#D4D4D4",
          400: "#A3A3A3",
          500: "#737373",
          600: "#525252",
          700: "#404040",
          800: "#262626",
          900: "#171717",
        },
      },
      fontFamily: {
        "sf-pro": [
          "-apple-system",
          "BlinkMacSystemFont",
          "SF Pro Display",
          "SF Pro Text",
          "Helvetica Neue",
          "Arial",
          "sans-serif",
        ],
      },
      borderRadius: {
        macos: "6px",
      },
      boxShadow: {
        macos: "0 2px 8px rgba(0, 0, 0, 0.1)",
        "macos-hover": "0 4px 12px rgba(0, 0, 0, 0.15)",
      },
    },
  },
  plugins: [],
};
