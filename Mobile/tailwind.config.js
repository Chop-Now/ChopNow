/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}', './components/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        primary: {
          50:  '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
        },
        surface: {
          DEFAULT: '#ffffff',
          secondary: '#f9fafb',
          tertiary: '#f3f4f6',
        },
        text: {
          primary: '#111827',
          secondary: '#6b7280',
          tertiary: '#9ca3af',
          inverse: '#ffffff',
        },
        border: {
          DEFAULT: '#e5e7eb',
          strong: '#d1d5db',
        },
        error:   '#ef4444',
        warning: '#f59e0b',
        success: '#22c55e',
        info:    '#3b82f6',
      },
      fontFamily: {
        sans:    ['Inter_400Regular', 'System'],
        medium:  ['Inter_500Medium', 'System'],
        semibold:['Inter_600SemiBold', 'System'],
        bold:    ['Inter_700Bold', 'System'],
      },
      borderRadius: {
        '4xl': '2rem',
      },
    },
  },
  plugins: [],
};
