import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Couleurs personnalisées pour le thème clair
        light: {
          primary: '#3B82F6',
          secondary: '#10B981',
          background: '#F3F4F6',
          text: '#1F2937',
        },
        // Couleurs personnalisées pour le thème sombre
        dark: {
          primary: '#60A5FA',
          secondary: '#34D399',
          background: '#111827',
          text: '#F9FAFB',
        },
      },
    },
  },
  plugins: [require('daisyui')],
  daisyui: {
    themes: [
      {
        light: {
          ...require('daisyui/src/theming/themes')['[data-theme=light]'],
          primary: '#3B82F6',
          secondary: '#10B981',
          'base-100': '#F3F4F6',
          'base-content': '#1F2937',
        },
        dark: {
          ...require('daisyui/src/theming/themes')['[data-theme=dark]'],
          primary: '#60A5FA',
          secondary: '#34D399',
          'base-100': '#111827',
          'base-content': '#F9FAFB',
        },
      },
    ],
  },
};

export default config;
