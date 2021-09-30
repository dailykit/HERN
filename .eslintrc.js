module.exports = {
   parser: 'babel-eslint',
   env: {
      browser: true,
      es2021: true
   },
   extends: ['airbnb-base', 'prettier'],
   parserOptions: {
      ecmaVersion: 12,
      sourceType: 'module'
   },
   rules: {
      'no-underscore-dangle': 0,
      'import/imports-first': ['error', 'absolute-first'],
      'import/newline-after-import': 'error',
      'import/prefer-default-export': 0,
      'no-case-declarations': 0,
      radix: 0,
      camelcase: 0,
      'no-alert': 1,
      'no-shadow': 1,
      'consistent-return': 1,
      'graphql/template-strings': [
         'error',
         {
            // Import default settings for your GraphQL client. Supported values:
            // 'apollo', 'relay', 'lokka', 'fraql', 'literal'
            env: 'apollo',

            // Import your schema JSON here
            schemaJson: require('./schema.json')

            // OR provide absolute path to your schema JSON (but not if using `eslint --cache`!)
            // schemaJsonFilepath: path.resolve(__dirname, './schema.json'),

            // OR provide the schema in the Schema Language format
            // schemaString: printSchema(schema),

            // tagName is gql by default
         }
      ]
   },
   plugins: ['graphql']
}
