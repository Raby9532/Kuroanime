import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "var(--color-brand, #2f6fed)",
          dark:    "var(--color-brand-dark, #1d4ed8)",
          light:   "var(--color-brand-light, #64a6ff)",
        },
        surface: {
          DEFAULT: "var(--color-surface, #070b12)",
          1:       "var(--color-surface-1, #0c121c)",
          2:       "var(--color-surface-2, #131b28)",
          3:       "var(--color-surface-3, #1b2534)",
        },
        accent: {
          DEFAULT: "var(--color-accent, #22d3ee)",
        },
      },
      fontFamily: {
        display: ["var(--font-bebas)", "Impact", "sans-serif"],
        body:    ["var(--font-dm-sans)", "system-ui", "sans-serif"],
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
      },
    },
  },
  plugins: [],
};

export default config;
