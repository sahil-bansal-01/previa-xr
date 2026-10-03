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
          bg: "#07090e",
          surface: "#0d111c",
          surfaceLight: "#141b2d",
          border: "#1e293b",
          borderHighlight: "#334155",
          cyan: "#00f0ff",
          cyanGlow: "rgba(0, 240, 255, 0.25)",
          violet: "#8b5cf6",
          violetGlow: "rgba(139, 92, 246, 0.25)",
          accent: "#38bdf8",
          hazard: "#f59e0b",
          danger: "#ef4444",
          success: "#10b981",
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      animation: {
        'scanline': 'scan 4s linear infinite',
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow-cyan': 'glowCyan 2s ease-in-out infinite alternate',
      },
      keyframes: {
        scan: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(1000%)' },
        },
        glowCyan: {
          '0%': { boxShadow: '0 0 10px rgba(0, 240, 255, 0.2)' },
          '100%': { boxShadow: '0 0 25px rgba(0, 240, 255, 0.6)' },
        }
      }
    },
  },
  plugins: [],
}
