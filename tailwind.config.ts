import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      backgroundColor: {
        "soft-light": "linear-gradient(180deg, #F9FAF1 0%, #FEFFFB 100%)",
      },
      fontFamily: {
        vidaloka: ["Vidaloka", "serif"],
      },
      colors: {
        // Define your custom navy shades
        navy: {
          50: "#F0F4F8", // Very light navy-ish
          100: "#D9E2EC",
          200: "#BCCCDC",
          300: "#9FB3C8",
          400: "#829AB1",
          500: "#627D98",
          600: "#486581",
          700: "#334E68",
          800: "#243B53", // Deep Navy
          900: "#102A43", // Very Deep Navy
        },
        // Define your custom gold shades
        gold: {
          50: "#FFFBE6",
          100: "#FFF0B3",
          200: "#FFE680",
          300: "#FFD700", // Standard Gold
          400: "#E8B923", // Richer Gold
          500: "#D5A600", // Deeper Gold
          600: "#C29600",
          700: "#AD8900",
          800: "#997B00",
          900: "#856C00",
        },

        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
        // Custom colors for our real estate platform based on the new color palette
        estate: {
          mustard: "#FCD445", // Mustard
          blue: "#345995", // YinMn Blue
          lime: "#50CB35", // Lime Green
          tomato: "#FB4D3D", // Tomato
          rose: "#CA1551", // Rose Red
          lightGray: "#F7FAFC",
          gold: "#FFCC11",
          teal: "#008080",
          indigo: "#4B0082",
          navy: "#1F3A60",
          yellow: "#FFD700",
          gray: "#718096",
          darkGray: "#2D3748",
          success: "#50CB35", // Using Lime Green for success
          error: "#FB4D3D", // Using Tomato for error
          warning: "#FCD445", // Using Mustard for warning
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: {
            height: "0",
          },
          to: {
            height: "var(--radix-accordion-content-height)",
          },
        },
        "accordion-up": {
          from: {
            height: "var(--radix-accordion-content-height)",
          },
          to: {
            height: "0",
          },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;

