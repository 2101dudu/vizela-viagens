const flowbite = require("flowbite-react/tailwind");

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    flowbite.content(),
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        softBackground: "var(--soft-background)",
        foreground: "var(--foreground)",
        highlight: "var(--highlight)",
        softhighlight: "var(--soft-highlight)",
      },
      dropShadow: {
        my: "0 0px 35px rgba(0, 0, 0, 0.15)",
      },
    },
  },
  plugins: [flowbite.plugin()],
};
