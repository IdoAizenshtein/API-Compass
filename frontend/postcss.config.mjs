const config = {
  content: [
    "./index.html",
    './pages/*.{js,jsx,ts,tsx}', // תוודא שכל הקבצים שעושים שימוש במסגרות Tailwind נכללים
    './components/**/*.{js,jsx,ts,tsx}',
    './styles/*.css',
  ],
  theme: {
    extend: {
      colors: {
        customGray: {
          100: '#f7fafc',
          50: '#f9fafb',
        },
      },
    },
  },
  plugins: {
    "@tailwindcss/postcss": {},
  }
};

export default config;
