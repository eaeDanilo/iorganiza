import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{ts,tsx}',
    './src/components/**/*.{ts,tsx}',
    './src/app/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: { '2xl': '1400px' },
    },
    extend: {
      colors: {
        background: '#000000',
        surface: '#0F1B12',
        border: '#333333',
        foreground: '#FFFFFF',
        muted: { DEFAULT: '#152018', foreground: '#A0A0A0' },
        primary: { DEFAULT: '#0066FF', foreground: '#FFFFFF' },
        secondary: { DEFAULT: '#FF0055', foreground: '#FFFFFF' },
        success: '#00D084',
        destructive: { DEFAULT: '#FF3B30', foreground: '#FFFFFF' },
        accent: { DEFAULT: '#0066FF', foreground: '#FFFFFF' },
        card: { DEFAULT: '#0F1B12', foreground: '#FFFFFF' },
        popover: { DEFAULT: '#0F1B12', foreground: '#FFFFFF' },
        input: '#333333',
        ring: '#0066FF',
      },
      borderRadius: {
        '2xl': '1.5rem',
        xl: '1.25rem',
        lg: '1rem',
        md: '0.625rem',
        sm: '0.375rem',
      },
      boxShadow: {
        card: '0 4px 24px -8px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255,255,255,0.04)',
        glow: '0 0 32px -4px rgba(0, 102, 255, 0.35)',
        'glow-coral': '0 0 32px -4px rgba(255, 0, 85, 0.35)',
      },
      backgroundImage: {
        'gradient-hero': 'linear-gradient(135deg, #0066FF 0%, #6B2EE6 50%, #FF0055 100%)',
        'gradient-card': 'linear-gradient(180deg, rgba(15,27,18,1) 0%, rgba(10,20,13,1) 100%)',
        'gradient-stat': 'linear-gradient(135deg, rgba(0,102,255,0.15) 0%, rgba(255,0,85,0.08) 100%)',
      },
      fontFamily: {
        sans: ['var(--font-jakarta)', 'Plus Jakarta Sans', 'system-ui', 'sans-serif'],
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'fade-in': 'fade-in 0.3s ease-out',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};

export default config;
