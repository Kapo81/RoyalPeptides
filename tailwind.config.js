/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      animationDelay: {
        '0': '0s',
        '5s': '5s',
        '10s': '10s',
      },
      keyframes: {
        'hero-drift': {
          '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
          '25%': { transform: 'translate(10px, -10px) scale(1.05)' },
          '50%': { transform: 'translate(-5px, 10px) scale(0.98)' },
          '75%': { transform: 'translate(-10px, -5px) scale(1.02)' },
        },
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-up-delayed': {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'sheen': {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
      },
      animation: {
        'hero-drift': 'hero-drift 18s ease-in-out infinite',
        'fade-up': 'fade-up 0.6s ease-out',
        'fade-up-delayed': 'fade-up-delayed 0.6s ease-out 0.3s both',
        'fade-in': 'fade-in 0.8s ease-out 0.6s both',
        'sheen': 'sheen 10s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
