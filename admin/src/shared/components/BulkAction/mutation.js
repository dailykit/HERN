import { Modifier } from 'draft-js'
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
export const UPDATE_SUBSCRIPTION_OCCURRENCE_PRODUCT = gql`
   mutation update_subscription_subscriptionOccurence_products(
      $ids: [Int!]
      $_set: subscription_subscriptionOccurence_product_set_input!
   ) {
      update_subscription_subscriptionOccurence_product(
         _set: $_set
         where: { id: { _in: $ids } }
      ) {
         affected_rows
      }
   }
`
export const INCREASE_PRICE_SUBSCRIPTION_OCCURRENCE_PRODUCT = gql`
   mutation increasePrice(
      $addOnPrice: numeric!
      $where: subscription_subscriptionOccurence_product_bool_exp!
   ) {
      update_subscription_subscriptionOccurence_product(
         _inc: { addOnPrice: $addOnPrice }
         where: $where
      ) {
         affected_rows
      }
   }
`
// export const UPDATE_SUBSCRIPTION_OCCURRENCES = gql`
//    mutation update_subscription_subscription($id: Int!) {
//       update_subscription_subscription_by_pk(pk_columns: { id: $id }) {
//          id
//          subscriptionOccurences_aggregate {
//             aggregate {
//                count
//             }
//             nodes {
//                cutoffTimeStamp
//                startTimeStamp
//                id
//             }
//          }
//       }
//    }
// `
export const MODIFY_TIMESTAMP = gql`
   query ConcatenateStringColumn($timeStamp: concatenateTimeStamp_args!) {
      concatenateTimeStamp(args: $timeStamp) {
         message
         success
      }
   }
`
export const ADD_TO_SUBSCRIPTION = gql`
   mutation addToSubscription(
      $ids: [Int!]
      $_set: subscription_subscriptionOccurence_product_set_input!
   ) {
      update_subscription_subscriptionOccurence_product(
         where: { id: { _in: $ids } }
         _set: $_set
      ) {
         affected_rows
      }
   }
`
export const MANAGE_ADD_TO_SUBSCRIPTION = gql`
   mutation manageAddToSubscription(
      $ids: [Int!]
      $_set: subscription_subscriptionOccurence_addOn_set_input!
   ) {
      update_subscription_subscriptionOccurence_addOn(
         where: { id: { _in: $ids } }
         _set: $_set
      ) {
         affected_rows
      }
   }
`
export const INCREASE_PRICE_MANAGE_ADDON_SUBSCRIPTION_PRODUCT = gql`
   mutation increaseUnitPrice(
      $where: subscription_subscriptionOccurence_addOn_bool_exp!
      $unitPrice: numeric!
   ) {
      update_subscription_subscriptionOccurence_addOn(
         _inc: { unitPrice: $unitPrice }
         where: $where
      ) {
         affected_rows
      }
   }
`
