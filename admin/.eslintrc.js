module.exports = {
   extends: ['airbnb', 'prettier', 'prettier/react'],
   plugins: ['prettier', 'graphql'],
   parser: 'babel-eslint',
   globals: {
      window: true,
      document: true,
      localStorage: true,
      fetch: true,
   },
   rules: {
      'graphql/template-strings': [
         'error',
         {
            // Import default settings for your GraphQL client. Supported values:
            // 'apollo', 'relay', 'lokka', 'fraql', 'literal'
            env: 'apollo',

            // Import your schema JSON here
            schemaJson: require('./schema.json'),

            // OR provide absolute path to your schema JSON (but not if using `eslint --cache`!)
            // schemaJsonFilepath: path.resolve(__dirname, './schema.json'),

            // OR provide the schema in the Schema Language format
            // schemaString: printSchema(schema),

            // tagName is gql by default
         },
      ],
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
