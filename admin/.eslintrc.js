module.exports = {
   root: true,
   extends: ['airbnb', 'prettier'],
   plugins: ['prettier'],
   parser: 'babel-eslint',
   globals: {
      window: true,
      document: true,
      localStorage: true,
      fetch: true,
   },
   rules: {
      'react/jsx-filename-extension': [
         1,
         {
            extensions: ['.js', '.jsx'],
         },
      ],
      'react/prop-types': 0,
      'no-underscore-dangle': 0,
      'import/imports-first': ['error', 'absolute-first'],
      'import/newline-after-import': 'error',
      'import/prefer-default-export': 0,
      'no-case-declarations': 0,
      radix: 0,
      camelcase: 1,
      'no-alert': 1,
      'no-shadow': 1,
      'consistent-return': 1,
   },
}
