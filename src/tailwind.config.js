/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        blanco: "#FFFFFF",
        "navbar-bg": "#212529",
        "texto-h1": "theme(colors.sky.700)",
        "bglogin": "rgba(255, 255, 255, 0.08)",
        "venezuela-yellow": "#FED900",
        "venezuela-blue": "#00A6DA",
        "venezuela-red": "#EF2B2D",
      },
      keyframes: {
        "colorize-flag": {
          "0%": { filter: "grayscale(100%) brightness(0.5)" }, // Blanco y negro, oscuro
          "50%": { filter: "grayscale(50%) brightness(0.8)" }, // Algo de color, más brillante
          "100%": { filter: "grayscale(0%) brightness(1)" }, // A todo color, brillo normal
        },
      },
      animation: {
        "colorize-flag": "colorize-flag 2s ease-in-out forwards",
        // 'fill-gradient': 'fill-gradient 2s linear forwards', // Puedes eliminar esta si ya no la usas
      },
    },
  },
  plugins: [],
};
