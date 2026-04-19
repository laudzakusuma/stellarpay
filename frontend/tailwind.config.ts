import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        surface: {
          DEFAULT: '#080C14',
          1: '#0D1321',
          2: '#111827',
          3: '#1a2235',
          4: '#1e2d42',
        },
        accent: {
          gold: '#E8B86D',
          'gold-light': '#F5D08A',
          'gold-dark': '#C9942E',
          cyan: '#38BDF8',
          'cyan-dark': '#0EA5E9',
        },
        text: {
          primary: '#F1F5F9',
          secondary: '#94A3B8',
          muted: '#4B5563',
        },
        status: {
          success: '#10B981',
          warning: '#F59E0B',
          error: '#EF4444',
          pending: '#8B5CF6',
        },
      },
      fontFamily: {
        display: ['var(--font-sora)', 'sans-serif'],
        body: ['var(--font-outfit)', 'sans-serif'],
        mono: ['var(--font-geist-mono)', 'monospace'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-mesh':
          'radial-gradient(at 40% 20%, hsla(217,100%,15%,1) 0px, transparent 50%), radial-gradient(at 80% 0%, hsla(189,100%,10%,1) 0px, transparent 50%), radial-gradient(at 0% 50%, hsla(355,100%,10%,1) 0px, transparent 50%)',
        'card-gradient':
          'linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)',
        'gold-gradient':
          'linear-gradient(135deg, #E8B86D 0%, #F5D08A 50%, #C9942E 100%)',
      },
      boxShadow: {
        'glow-gold': '0 0 30px rgba(232, 184, 109, 0.15)',
        'glow-cyan': '0 0 30px rgba(56, 189, 248, 0.15)',
        card: '0 4px 24px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)',
        'card-hover': '0 8px 40px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.08)',
      },
      animation: {
        'fade-up': 'fadeUp 0.6s ease-out forwards',
        'fade-in': 'fadeIn 0.4s ease-out forwards',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'slide-in': 'slideIn 0.3s ease-out',
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        slideIn: {
          '0%': { opacity: '0', transform: 'translateX(-10px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
      },
      transitionTimingFunction: {
        spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
    },
  },
  plugins: [],
};

export default config;
