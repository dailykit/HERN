import gql from 'graphql-tag'

export const CUISINES_NAMES = gql`
   subscription Cuisines {
      cuisineNames {
         id
         title: name
      }
   }
`
export const INGREDIENT_CATEGORIES_INGREDIENTS_AGGREGATE = gql`
   subscription IngredientCategoryIngredientsAggregate {
      ingredientCategories {
         name
         title: name
         ingredients_aggregate {
            aggregate {
               count
               description: count
            }
         }
      }
   }
`
export const PRODUCT_OPTION_TYPES = {
   LIST: gql`
      subscription ProductOptionTypes {
         productOptionTypes {
            id: title
            title
            orderMode
         }
      }
   `,
}
export const PRODUCT_CATEGORY_OF_SUBSCRIPTION_OCCURRENCE_PRODUCT = gql`
   subscription productCategory {
      productCategories {
         name
         title: name
         subscriptionOccurenceProducts_aggregate {
            aggregate {
               count
               description: count
            }
         }
      }
   }
`
