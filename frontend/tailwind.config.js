/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#4F46E5",
        primaryHover: "#6366F1",
        accent: "#22D3EE",
        bgLight: "#F8FAFC",
        cardLight: "#FFFFFF",
        borderLight: "#E2E8F0"
      },
      animation: {
  fadeIn: "fadeIn 0.4s ease-in-out"
},
keyframes: {
  fadeIn: {
    "0%": { opacity: 0, transform: "translateY(8px)" },
    "100%": { opacity: 1, transform: "translateY(0)" }
  }
}
    },
  },
  plugins: [],
}