/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [
    require('daisyui'),
  ],
  daisyui: {
    themes: [
      {
        "dark-green": {
          "primary": "#00C853",
          "secondary": "#4CAF50", 
          "accent": "#81C784",
          "neutral": "#212121",
          "base-100": "#121212",
          "base-200": "#1E1E1E",
          "base-300": "#2D2D2D",
          "info": "#2196F3",
          "success": "#4CAF50",
          "warning": "#FF9800",
          "error": "#F44336",
        },
      },
    ],
  },
}

