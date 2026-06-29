/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Palette calda e naturale
        cream: {
          50: '#FFFDF8',
          100: '#FDF8F0',
          200: '#FAF0DC',
          300: '#F5E4C0',
          400: '#EDD09A',
        },
        sage: {
          50: '#F2F6F0',
          100: '#E0EBD9',
          200: '#BDD4B3',
          300: '#94B889',
          400: '#6B8F5E',
          500: '#527A45',
          600: '#3E6233',
          700: '#2E4C25',
        },
        terracotta: {
          50: '#FEF5F0',
          100: '#FDE8DC',
          200: '#F9C8B0',
          300: '#F3A07A',
          400: '#E87A4A',
          500: '#D4612D',
          600: '#B54D20',
        },
        amber: {
          warm: '#F59E0B',
          light: '#FEF3C7',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Fraunces', 'Georgia', 'serif'],
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      boxShadow: {
        'soft': '0 2px 15px -3px rgba(0,0,0,0.07), 0 10px 20px -2px rgba(0,0,0,0.04)',
        'card': '0 4px 24px -4px rgba(107,143,94,0.12)',
        'glow': '0 0 20px rgba(107,143,94,0.3)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'bounce-soft': 'bounceSoft 0.6s ease-out',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(12px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        bounceSoft: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
      }
    },
  },
  plugins: [],
}
