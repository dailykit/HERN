import gql from 'graphql-tag'

export const SIMPLE_RECIPE_UPDATE = gql`
   mutation UpdateSimpleRecipe(
      $ids: [Int!]
      $_set: simpleRecipe_simpleRecipe_set_input
   ) {
      updateSimpleRecipe(where: { id: { _in: $ids } }, _set: $_set) {
         affected_rows
      }
   }
`

export const UPDATE_PRODUCTS = gql`
   mutation UpdateProducts($ids: [Int!], $_set: products_product_set_input) {
      updateProducts(where: { id: { _in: $ids } }, _set: $_set) {
         affected_rows
      }
   }
`
export const UPDATE_INGREDIENTS = gql`
   mutation UpdateIngredients(
      $ids: [Int!]
      $_set: ingredient_ingredient_set_input
   ) {
      updateIngredient(where: { id: { _in: $ids } }, _set: $_set) {
         affected_rows
      }
   }
`
export const CONCATENATE_ARRAY_COLUMN = gql`
   query ConcatenateArrayColumn($concatData: concatenateArrayColumn_args!) {
      concatenateArrayColumn(args: $concatData) {
         message
         success
      }
   }
`
export const CONCATENATE_STRING_COLUMN = gql`
   query ConcatenateStringColumn($concatDataString: concatenateColumn_args!) {
      concatenateColumn(args: $concatDataString) {
         message
         success
      }
   }
`
export const UPDATE_PRODUCT_OPTIONS = gql`
   mutation updateProductOptions(
      $ids: [Int!]
      $_set: products_productOption_set_input!
   ) {
      updateProductOptions(where: { id: { _in: $ids } }, _set: $_set) {
         affected_rows
      }
   }
`
export const CREATE_CUISINE_NAME = gql`
   mutation CreateCuisineName($name: String) {
      createCuisineName(objects: { name: $name }) {
         affected_rows
      }
   }
`
export const INGREDIENT_CATEGORY_CREATE = gql`
   mutation insertIngredientCategory($name: String!) {
      createIngredientCategory(object: { name: $name }) {
         name
      }
   }
`
export const INCREASE_PRICE_AND_DISCOUNT = gql`
   mutation increasePriceAndDiscount(
      $price: numeric!
      $discount: numeric!
      $ids: [Int!]
   ) {
      updateProducts(
         where: { id: { _in: $ids } }
         _inc: { price: $price, discount: $discount }
      ) {
         affected_rows
      }
   }
`
export const INCREMENTS_IN_PRODUCT_OPTIONS = gql`
   mutation IncrementsInProductOptions(
      $_inc: products_productOption_inc_input!
      $_in: [Int!]
   ) {
      updateProductOptions(where: { id: { _in: $_in } }, _inc: $_inc) {
         affected_rows
      }
   }
`
