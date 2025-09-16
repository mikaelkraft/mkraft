/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Primary Colors
        'primary': '#00FFFF', // electric cyan
        'primary-foreground': '#0A0A0F', // deep space blue-black
        
        // Secondary Colors
        'secondary': '#FF0080', // vibrant magenta
        'secondary-foreground': '#E0E0E0', // high-contrast light gray
        
        // Accent Colors
        'accent': '#39FF14', // matrix green
        'accent-foreground': '#0A0A0F', // deep space blue-black
        
        // Background Colors
        'background': '#0A0A0F', // deep space blue-black
        'surface': '#1A1A2E', // elevated dark blue-gray
        
        // Text Colors
        'text-primary': '#E0E0E0', // high-contrast light gray
        'text-secondary': '#A0A0B0', // muted blue-gray
        
        // Status Colors
        'success': '#39FF14', // matrix green
        'success-foreground': '#0A0A0F', // deep space blue-black
        
        'warning': '#FFB000', // amber
        'warning-foreground': '#0A0A0F', // deep space blue-black
        
        'error': '#FF3366', // bright red-pink
        'error-foreground': '#E0E0E0', // high-contrast light gray
        
        // Border Colors
        'border': '#1A1A2E', // elevated dark blue-gray
        'border-accent': '#00FFFF', // electric cyan
      },
      fontFamily: {
        'heading': ['JetBrains Mono', 'monospace'],
        'body': ['Inter', 'sans-serif'],
        'caption': ['Roboto Mono', 'monospace'],
        'code': ['Fira Code', 'monospace'],
      },
      fontSize: {
        'fluid-xs': 'clamp(0.75rem, 0.7rem + 0.25vw, 0.875rem)',
        'fluid-sm': 'clamp(0.875rem, 0.8rem + 0.375vw, 1rem)',
        'fluid-base': 'clamp(1rem, 0.9rem + 0.5vw, 1.125rem)',
        'fluid-lg': 'clamp(1.125rem, 1rem + 0.625vw, 1.25rem)',
        'fluid-xl': 'clamp(1.25rem, 1.1rem + 0.75vw, 1.5rem)',
        'fluid-2xl': 'clamp(1.5rem, 1.3rem + 1vw, 1.875rem)',
        'fluid-3xl': 'clamp(1.875rem, 1.6rem + 1.375vw, 2.25rem)',
        'fluid-4xl': 'clamp(2.25rem, 1.9rem + 1.75vw, 3rem)',
      },
      boxShadow: {
        'glow-primary': '0 0 8px rgba(0, 255, 255, 0.2)',
        'glow-secondary': '0 0 8px rgba(255, 0, 128, 0.2)',
        'glow-accent': '0 0 8px rgba(57, 255, 20, 0.2)',
        'glow-primary-lg': '0 0 16px rgba(0, 255, 255, 0.3)',
        'glow-secondary-lg': '0 0 16px rgba(255, 0, 128, 0.3)',
        'glow-accent-lg': '0 0 16px rgba(57, 255, 20, 0.3)',
        'neon': '0 0 4px rgba(0, 255, 255, 0.3), inset 0 0 4px rgba(0, 255, 255, 0.1)',
      },
      animation: {
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite alternate',
        'terminal-scan': 'terminal-scan 1.5s ease-in-out infinite',
        'fade-in': 'fade-in 0.3s ease-out',
        'slide-in-right': 'slide-in-right 0.3s ease-out',
        'slide-in-left': 'slide-in-left 0.3s ease-out',
      },
      keyframes: {
        'pulse-glow': {
          'from': {
            'box-shadow': '0 0 4px rgba(0, 255, 255, 0.2)',
          },
          'to': {
            'box-shadow': '0 0 12px rgba(0, 255, 255, 0.4)',
          },
        },
        'terminal-scan': {
          '0%': {
            'left': '-100%',
          },
          '100%': {
            'left': '100%',
          },
        },
        'fade-in': {
          'from': {
            'opacity': '0',
          },
          'to': {
            'opacity': '1',
          },
        },
        'slide-in-right': {
          'from': {
            'transform': 'translateX(100%)',
          },
          'to': {
            'transform': 'translateX(0)',
          },
        },
        'slide-in-left': {
          'from': {
            'transform': 'translateX(-100%)',
          },
          'to': {
            'transform': 'translateX(0)',
          },
        },
      },
      transitionTimingFunction: {
        'cyber': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
      transitionDuration: {
        'fast': '150ms',
        'normal': '300ms',
        'slow': '500ms',
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '112': '28rem',
        '128': '32rem',
      },
      zIndex: {
        '60': '60',
        '70': '70',
        '80': '80',
        '90': '90',
        '100': '100',
      },
      backdropBlur: {
        'xs': '2px',
      },
      minHeight: {
        'screen-minus-header': 'calc(100vh - 4rem)',
        'screen-minus-header-mobile': 'calc(100vh - 3.5rem)',
      },
      maxWidth: {
        '8xl': '88rem',
        '9xl': '96rem',
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
    require('@tailwindcss/forms'),
    require('@tailwindcss/aspect-ratio'),
  ],
}