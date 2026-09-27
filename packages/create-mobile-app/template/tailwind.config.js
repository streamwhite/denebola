/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        background: "rgb(var(--color-background))",
        foreground: "rgb(var(--color-foreground))",
        card: "rgb(var(--color-card))",
        primary: "rgb(var(--color-primary))",
        muted: "rgb(var(--color-muted))",
        border: "rgb(var(--color-border))",
        destructive: "rgb(var(--color-destructive))",
      },
    },
  },
  plugins: [],
};
