import tokens from '../shared/design-tokens.json';

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}', './components/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: tokens.colors.primary,
        'primary-dark': tokens.colors.primaryDark,
        secondary: tokens.colors.secondary,
        accent: tokens.colors.accent,
        'text-primary': tokens.colors.text.primary,
        'text-secondary': tokens.colors.text.secondary,
      },
      spacing: {
        xs: `${tokens.spacing.xs}px`,
        sm: `${tokens.spacing.sm}px`,
        md: `${tokens.spacing.md}px`,
        lg: `${tokens.spacing.lg}px`,
        xl: `${tokens.spacing.xl}px`,
      },
      borderRadius: {
        sm: `${tokens.borderRadius.sm}px`,
        md: `${tokens.borderRadius.md}px`,
        lg: `${tokens.borderRadius.lg}px`,
        xl: `${tokens.borderRadius.xl}px`,
      },
    },
  },
  plugins: [],
};
