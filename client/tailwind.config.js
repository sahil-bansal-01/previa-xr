/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        previa: {
          bg: "#F7F8FA",
          surface: "#FFFFFF",
          surfaceSoft: "#F1F3F5",
          border: "#E2E5E9",
          borderHighlight: "#CBD5E1",
          primary: "#2563EB",
          primaryHover: "#1D4ED8",
          primaryLight: "#EFF6FF",
          secondary: "#14B8A6",
          textPrimary: "#172033",
          textSecondary: "#667085",
          textMuted: "#98A2B3",
          hazard: "#F59E0B",
          danger: "#DC2626",
          dangerLight: "#FEF2F2",
          success: "#16A34A",
          successLight: "#F0FDF4",
        }
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      boxShadow: {
        'subtle': '0 1px 3px 0 rgba(16, 24, 40, 0.05), 0 1px 2px -1px rgba(16, 24, 40, 0.05)',
        'elevated': '0 4px 6px -1px rgba(16, 24, 40, 0.07), 0 2px 4px -2px rgba(16, 24, 40, 0.05)',
        'card': '0 10px 15px -3px rgba(16, 24, 40, 0.05), 0 4px 6px -4px rgba(16, 24, 40, 0.03)',
      }
    },
  },
  plugins: [],
}
