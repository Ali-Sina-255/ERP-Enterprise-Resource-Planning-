const flowbite = require("flowbite-react/tailwind");
// const srollbar=require('tailwind-scrollbar')
/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}", flowbite.content()],
  theme: {
    extend: {
      colors: {
       primary: {
          DEFAULT: 'hsl(222.2, 47.4%, 11.2%)', // Example primary (dark blue)
          foreground: 'hsl(210, 40%, 98%)',   // Light text for primary
        },
        secondary: {
          DEFAULT: 'hsl(210, 40%, 96.1%)', // Example secondary (light gray)
          foreground: 'hsl(222.2, 47.4%, 11.2%)', // Dark text for secondary
        },
        accent: {
          DEFAULT: 'hsl(172, 67%, 40%)', // Example accent (teal)
          foreground: 'hsl(210, 40%, 98%)',
        },
       
      
      },
       borderRadius: {
        lg: `0.5rem`,
        md: `calc(0.5rem - 2px)`,
        sm: `calc(0.5rem - 4px)`,
      },
    },
    fontFamily: {
      abc: ["Noto Nastaliq Urdu", "serif"],
      me: ["Amir", "serif"],
    },
  },
  plugins: [
    flowbite.plugin(),
    require("tailwind-scrollbar"),
    require("tailwind-scrollbar-hide"),
  ],
}; 
