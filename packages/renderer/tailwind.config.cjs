module.exports = {
  content: [
    './packages/renderer/index.html',
    './packages/renderer/src/**/*.{html,js,svelte,ts}'
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
      },
      zIndex: {
        'mobile-stepper': 1000,
        'speed-dial': 1050,
        'app-bar': 1100,
        drawer: 1200,
        modal: 1300,
        snackbar: 1400,
        tooltip: 1500
      }
    },
    screens: {
      xs: '480px',
      sm: '640px',
      md: '1024px',
      lg: '1440px',
      xl: '1920px'
    }
  },
  variants: {
    extend: {
      textColor: ['active']
    }
  },
  plugins: []
};
