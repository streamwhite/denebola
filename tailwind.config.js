/** @type {import('tailwindcss').Config} */
const { dirname, join } = require("node:path");

// Scan this project's own source plus the runtime package source, whose components use
// className too. Without the second entry those utilities are never generated and the
// framework UI renders unstyled.
function templateSource() {
  try {
    return join(dirname(require.resolve("denebola/package.json")), "src/**/*.{js,jsx,ts,tsx}");
  } catch {
    return null;
  }
}

const framework = templateSource();

module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}", ...(framework ? [framework] : [])],
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
