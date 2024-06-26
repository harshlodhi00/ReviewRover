import { fontFamily } from "tailwindcss/defaultTheme";

import tailwindTypography from "@tailwindcss/typography";

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        sans: ["Work Sans", ...fontFamily.sans],
      },
    },
  },
  plugins: [tailwindTypography],
};
