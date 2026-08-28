/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        coop: {
          50: '#EEF5FD',
          100: '#DCEBFB',
          200: '#BBD7F7',
          300: '#8BBCEF',
          400: '#5A9CF0',
          500: '#2F80ED', // Primary Blue
          600: '#2563EB', // Secondary Blue
          700: '#1F55C4',
          800: '#1B429B',
          900: '#172033', // Dark Navy
          950: '#0D1321'
        },
        teal: {
          50: '#E6FAF8',
          100: '#CCF4F0',
          200: '#9CE7E1',
          300: '#5ED5CD',
          400: '#28C4BB',
          500: '#12B8B0', // Brand Teal
          600: '#0FA6A0',
          700: '#0D8D88',
          800: '#0C716D'
        },
        navy: {
          DEFAULT: '#172033',
          dark: '#0D1321',
          light: '#252B3A'
        },
        ink: {
          DEFAULT: '#252B3A',
          muted: '#667085'
        },
        surface: {
          light: '#FFFFFF',
          bg: '#F7F9FC',
          border: '#E5E7EB',
          subtle: '#F1F5F9'
        },
        status: {
          success: '#16A34A',
          warning: '#F59E0B',
          error: '#DC2626',
          info: '#2563EB'
        },
        welfare: {
          green: '#10B981',
          amber: '#F59E0B',
          rose: '#F43F5E'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif']
      },
      backgroundImage: {
        // Subtle blue → teal brand gradient used selectively on CTAs / hero / auth headers
        'brand': 'linear-gradient(135deg, #2F80ED 0%, #12B8B0 100%)',
        'brand-soft': 'linear-gradient(135deg, rgba(47,128,237,0.08) 0%, rgba(18,184,176,0.08) 100%)',
      },
      borderRadius: {
        'card': '16px',
        'btn': '12px',
        'input': '12px',
        'pill': '9999px'
      },
      boxShadow: {
        'subtle': '0 1px 3px 0 rgba(23, 32, 51, 0.06), 0 1px 2px -1px rgba(23, 32, 51, 0.05)',
        'card': '0 1px 4px rgba(23, 32, 51, 0.04), 0 2px 8px rgba(23, 32, 51, 0.04)',
        'elevated': '0 10px 24px rgba(23, 32, 51, 0.08)',
        'soft': '0 6px 18px rgba(47, 128, 237, 0.12)'
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' }
        }
      },
      animation: {
        'fade-up': 'fade-up 0.4s ease-out',
        'fade-in': 'fade-in 0.3s ease-out'
      }
    },
  },
  plugins: [],
}
