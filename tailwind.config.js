/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)", "sans-serif"],
        serif: ["var(--font-playfair)", "serif"],
        mono: ["var(--font-geist-mono)", "monospace"],
      },
      colors: {
        luxury: {
          50: '#FDFBF7',
          100: '#F5F2EB',
          200: '#E6DFC8',
          300: '#D4AF37',
          400: '#C5A880',
          500: '#A38456',
          600: '#7E623B',
          700: '#5A4325',
          800: '#382814',
          900: '#1C1207',
          black: '#0a0a0a',
          charcoal: '#171717',
          cream: '#FAF8F5',
        },
        admin: {
          bg: '#0B0D11',
          card: '#131720',
          border: '#202636',
          hover: '#1B212D',
          muted: '#8A94A6',
          text: '#F3F4F6',
          accent: '#C5A880',
        }
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out forwards',
        'slide-up': 'slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'marquee': 'marquee 25s linear infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        marquee: {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-50%)' },
        }
      }
    },
  },
  plugins: [],
};
