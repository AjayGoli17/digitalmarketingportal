import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: "#FAFAFA",
        surface: {
          DEFAULT: "#FBF8FF",
          dim: "#DAD9E3",
          bright: "#FBF8FF",
          container: {
            lowest: "#FFFFFF",
            low: "#F4F2FD",
            DEFAULT: "#EEEDF7",
            high: "#E8E7F1",
            highest: "#E3E1EC",
          },
        },
        ink: {
          primary: "#09090B",
          secondary: "#71717A",
          tertiary: "#A1A1AA",
          muted: "#464555",
        },
        aura: {
          primary: "#4F46E5",
          "primary-deep": "#3525CD",
          "primary-container": "#4F46E5",
          "on-primary-container": "#DAD7FF",
          "primary-fixed": "#E2DFFF",
        },
        hairline: {
          DEFAULT: "rgba(9, 9, 11, 0.06)",
          subtle: "#E4E4E7",
          lavender: "#E8E7F1",
        },
        status: {
          pending: {
            bg: "#FEF3C7",
            text: "#D97706",
            border: "#FDE68A",
            dot: "#D97706",
          },
          changes: {
            bg: "#FEE2E2",
            text: "#DC2626",
            border: "#FECACA",
            dot: "#DC2626",
          },
          approved: {
            bg: "#DCFCE7",
            text: "#16A34A",
            border: "#BBF7D0",
            dot: "#16A34A",
          },
          scheduled: {
            bg: "#EEF2FF",
            text: "#4F46E5",
            border: "#E0E7FF",
            dot: "#4F46E5",
          },
        },
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-geist-mono)", "monospace"],
      },
      fontSize: {
        "display-lg": ["2.25rem", { lineHeight: "2.75rem", letterSpacing: "-0.03em", fontWeight: "600" }],
        "headline-lg": ["1.5rem", { lineHeight: "2rem", letterSpacing: "-0.025em", fontWeight: "600" }],
        "headline-lg-mobile": ["1.25rem", { lineHeight: "1.75rem", letterSpacing: "-0.02em", fontWeight: "600" }],
        "headline-sm": ["1.125rem", { lineHeight: "1.5rem", letterSpacing: "-0.02em", fontWeight: "500" }],
        "title-md": ["0.9375rem", { lineHeight: "1.375rem", letterSpacing: "-0.015em", fontWeight: "500" }],
        "body-md": ["0.875rem", { lineHeight: "1.375rem", letterSpacing: "-0.01em", fontWeight: "400" }],
        "body-sm": ["0.8125rem", { lineHeight: "1.25rem", letterSpacing: "0", fontWeight: "400" }],
        "label-md": ["0.75rem", { lineHeight: "1rem", letterSpacing: "0.01em", fontWeight: "500" }],
        "label-caps": ["0.6875rem", { lineHeight: "0.875rem", letterSpacing: "0.06em", fontWeight: "600" }],
      },
      boxShadow: {
        whisper: "0 1px 3px 0 rgba(0, 0, 0, 0.04), 0 1px 2px -1px rgba(0, 0, 0, 0.02)",
        popover: "0 4px 12px 0 rgba(0, 0, 0, 0.05), 0 1px 3px 0 rgba(0, 0, 0, 0.03)",
        focus: "0 0 0 3px rgba(79, 70, 229, 0.08)",
      },
      borderRadius: {
        sm: "0.25rem",
        DEFAULT: "0.5rem",
        md: "0.75rem",
        lg: "1rem",
        xl: "1.5rem",
      },
      spacing: {
        "sidebar-desktop": "260px",
      },
    },
  },
  plugins: [],
};

export default config;
