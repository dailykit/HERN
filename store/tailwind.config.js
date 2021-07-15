module.exports = {
   theme: {
      extend: {
         colors: {
            teal: {
               100: '#E6FFFA',
               200: '#B2F5EA',
               300: '#81E6D9',
               400: '#4FD1C5',
               500: '#38B2AC',
               600: '#319795',
               700: '#2C7A7B',
               800: '#285E61',
               900: '#234E52',
            },
            orange: {
               100: '#FFFAF0',
               200: '#FEEBC8',
               300: '#FBD38D',
               400: '#F6AD55',
               500: '#ED8936',
               600: '#DD6B20',
               700: '#C05621',
               800: '#9C4221',
               900: '#7B341E',
            },
         },
      },
   },
   variants: {},
   plugins: [require('@tailwindcss/aspect-ratio')],
}
