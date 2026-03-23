/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'surface-base': '#0f172a',    
        'surface-sidebar': '#1e293b', 
        'surface-card': '#1e293b',    
        'surface-hover': '#334155',
        'border-light': '#334155',
        'border-active': '#475569',
        'text-primary': '#f8fafc',
        'text-secondary': '#e2e8f0',
        'text-tertiary': '#94a3b8',
        'accent-iris': '#6366f1',
        'accent-emerald': '#10b981', 
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out forwards',
        'pulse-slow': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(4px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        }
      }
    },
  },
  plugins: [],
}
