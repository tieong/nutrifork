/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['SF Pro Display', 'Inter', 'Plus Jakarta Sans', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
      colors: {
        // Bold Premium Brand Palette
        brand: {
          gold: '#f9b60d',
          'gold-light': '#fcd34d',
          'gold-dark': '#d9a00a',
          orange: '#ff7f00',
          'orange-light': '#ffa347',
          'orange-dark': '#cc6600',
          black: '#0a0a0a',
          'near-black': '#141414',
          'dark-gray': '#1a1a1a',
        },
        // Accent gradients
        accent: {
          warm: 'linear-gradient(135deg, #f9b60d 0%, #ff7f00 100%)',
        },
        // Premium glass surfaces
        glass: {
          light: 'rgba(255, 255, 255, 0.05)',
          DEFAULT: 'rgba(255, 255, 255, 0.08)',
          medium: 'rgba(255, 255, 255, 0.12)',
          dark: 'rgba(10, 10, 10, 0.85)',
          'dark-strong': 'rgba(10, 10, 10, 0.95)',
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'glass-gradient': 'linear-gradient(135deg, rgba(255, 255, 255, 0.12), rgba(255, 255, 255, 0.05))',
        'glass-gradient-dark': 'linear-gradient(135deg, rgba(10, 10, 10, 0.85), rgba(10, 10, 10, 0.95))',
        'warm-gradient': 'linear-gradient(135deg, #f9b60d 0%, #ff7f00 100%)',
        'warm-gradient-subtle': 'linear-gradient(135deg, rgba(249, 182, 13, 0.1) 0%, rgba(255, 127, 0, 0.05) 100%)',
        'dark-surface': 'linear-gradient(135deg, #141414 0%, #0a0a0a 100%)',
      },
      boxShadow: {
        'glass': '0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.08)',
        'glass-dark': '0 8px 32px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
        'glow-gold-sm': '0 0 20px rgba(249, 182, 13, 0.4)',
        'glow-gold-md': '0 0 30px rgba(249, 182, 13, 0.5)',
        'glow-gold-lg': '0 0 40px rgba(249, 182, 13, 0.6)',
        'glow-orange-sm': '0 0 20px rgba(255, 127, 0, 0.3)',
        'glow-orange-md': '0 0 30px rgba(255, 127, 0, 0.4)',
        'warm-glow': '0 10px 40px -10px rgba(249, 182, 13, 0.5), 0 0 20px rgba(255, 127, 0, 0.2)',
      },
      backdropBlur: {
        xs: '2px',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
        'slide-down': 'slideDown 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
        'scale-in': 'scaleIn 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        'shimmer': 'shimmer 2s infinite',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(249, 182, 13, 0.5)' },
          '50%': { boxShadow: '0 0 40px rgba(249, 182, 13, 0.8)' },
        },
      },
    },
  },
  plugins: [],
}
