import gql from 'graphql-tag'

export const INGREDIENTS_COUNT = gql`
   subscription IngredientsCount {
      ingredientsAggregate(where: { isArchived: { _eq: false } }) {
         aggregate {
            count
         }
      }
   }
`
export const CUISINES_NAMES = gql`
   subscription Cuisines {
      cuisineNames {
         id
         title: name
      }
   }
`
export const S_INGREDIENTS = gql`
   subscription Ingredients {
      ingredients(
         order_by: { createdAt: desc }
         where: { isArchived: { _eq: false } }
      ) {
         id
         name
         category
         image
         isValid
         isPublished
         createdAt
         ingredientProcessings_aggregate {
            aggregate {
               count
            }
         }
         ingredientSachetViews_aggregate {
            aggregate {
               count
            }
         }
      }
   }
`

export const S_PROCESSINGS = gql`
   subscription Processings($where: ingredient_ingredientProcessing_bool_exp) {
      ingredientProcessings(where: $where) {
         id
         ingredientId
         title: processingName
      }
   }
`
export const S_PROCESSINGS_ID = gql`
   subscription IngredientProcessings($_eq: Int!) {
      simpleRecipeIngredientProcessings(
         where: { simpleRecipeId: { _eq: $_eq } }
      ) {
         ingredientId
         processingId
      }
   }
`

export const S_SACHETS = gql`
   subscription Sachets($where: ingredient_ingredientSachet_bool_exp) {
      ingredientSachets(where: $where) {
         id
         isValid
         quantity
         unit
         ingredient {
            id
            name
         }
         ingredientProcessingId
         recipeYields {
            recipeYieldId
         }
      }
   }
`

export const S_INGREDIENT = gql`
   subscription Ingredient($id: Int!) {
      ingredient(id: $id) {
         id
         name
         category
         image
         assets
         isValid
         isPublished
         ingredientProcessings(
            order_by: { created_at: desc }
            where: { isArchived: { _eq: false } }
         ) {
            id
            processingName
            nutritionalInfo
            cost
            ingredientSachets(
               order_by: { createdAt: desc }
               where: { isArchived: { _eq: false } }
            ) {
               id
               tracking
               unit
               quantity
               nutritionalInfo
               cost
               liveMOF
               modeOfFulfillments(
                  where: { isArchived: { _eq: false } }
                  order_by: { position: desc_nulls_last }
               ) {
                  id
                  accuracy
                  isPublished
                  isLive
                  position
                  cost
                  operationConfig {
                     id
                     station {
                        id
                        name
                     }
                     labelTemplate {
                        id
                        name
                     }
                  }
                  packaging {
                     id
                     name
                  }
                  bulkItem {
                     id
                     processingName
                     committed
                     onHand
                     awaiting
                     unit
                     supplierItem {
                        id
                        name
                     }
                  }
                  sachetItem {
                     id
                     unitSize
                     unit
                     committed
                     onHand
                     awaiting
                     bulkItem {
                        id
                        processingName
                        supplierItem {
                           id
                           name
                        }
                     }
                  }
               }
            }
         }
         ingredientSachets(where: { isArchived: { _eq: false } }) {
            id
         }
      }
   }
`

export const RECIPES_COUNT = gql`
   subscription RecipesCount {
      simpleRecipesAggregate(where: { isArchived: { _eq: false } }) {
         aggregate {
            count
         }
      }
   }
`

export const S_RECIPES = gql`
   subscription SimpleRecipes {
      simpleRecipes(
         order_by: { created_at: asc }
         where: { isArchived: { _eq: false } }
      ) {
         id
         name
         author
         cookingTime
         cuisine
         isValid
         isPublished

         simpleRecipeYields: simpleRecipeYields_aggregate {
            aggregate {
               count
            }
         }
      }
   }
`

export const S_RECIPE = gql`
   subscription SimpleRecipe($id: Int!) {
      simpleRecipe(id: $id) {
         id
         name
         image
         assets
         isValid
         isSubRecipe
         isPublished
         author
         type
         description
         cookingTime
         notIncluded
         cuisine
         cuisineNameId {
            id
         }
         utensils
         showIngredients
         showIngredientsQuantity
         showProcedures
         instructionSets(order_by: { position: desc_nulls_last }) {
            id
            title
            position
            instructionSteps(order_by: { position: desc_nulls_last }) {
               id
               title
               position
               description
               assets
               isVisible
            }
         }
         simpleRecipeIngredients(
            where: { isArchived: { _eq: false } }
            order_by: { position: desc_nulls_last }
         ) {
            id
            includedWithProduct
            position
            ingredient {
               id
               name
            }
            processing: ingredientProcessing {
               id
               name: processingName
               nutritionalInfo
               cost
            }
            linkedSachets: simpleRecipeYield_ingredientSachets(
               where: { isArchived: { _eq: false } }
               order_by: { simpleRecipeYield: { yield: asc_nulls_last } }
            ) {
               ingredientSachet {
                  id
                  unit
                  quantity
                  cost
                  nutritionalInfo
               }
               simpleRecipeYield {
                  id
                  yield
                  baseYieldId
               }
               slipName
               isVisible
            }
         }
         simpleRecipeYields(
            where: { isArchived: { _eq: false } }
            order_by: { serving: asc }
         ) {
            id
            yield
            baseYieldId
            cost
            nutritionalInfo
            nutritionId
            nutritionIsInSync
         }
      }
   }
`

export const FETCH_PROCESSING_NAMES = gql`
   subscription MasterProcessings {
      masterProcessings {
         id
         title: name
      }
   }
`

export const FETCH_UNITS = gql`
   subscription Units {
      units {
         id
         title: name
      }
   }
`

export const FETCH_STATIONS = gql`
   subscription Stations {
      stations {
         id
         title: name
      }
   }
`

export const FETCH_PACKAGINGS = gql`
   subscription Packagings {
      packagings {
         id
         title: name
      }
   }
`

export const FETCH_LABEL_TEMPLATES = gql`
   subscription LabelTemplates {
      labelTemplates {
         id
         title: name
      }
   }
`

export const S_ACCOMPANIMENT_TYPES = gql`
   subscription {
      accompaniments {
         id
         title: name
      }
   }
`

export const MODIFIERS = gql`
   subscription Modifiers {
      modifiers {
         id
         title: name
      }
   }
`

// used for food cost percent
export const STORE_SETTINGS = gql`
   subscription StoreSettings($type: String!) {
      storeSettings(where: { type: { _eq: $type } }) {
         value
         identifier
      }
   }
`

export const S_SUPPLIER_ITEMS = gql`
   subscription SupplierItems {
      supplierItems(where: { isArchived: { _eq: false } }) {
         id
         name
         title: name
         unitSize
         unit
         prices
      }
   }
`

export const S_SACHET_ITEMS = gql`
   subscription {
      sachetItems(where: { isArchived: { _eq: false } }) {
         id
         unitSize
         unit
         bulkItem {
            id
            processingName
            supplierItem {
               id
               name
               prices
            }
         }
      }
   }
`

export const S_BULK_ITEMS = gql`
   subscription BulkItems {
      bulkItems(where: { isArchived: { _eq: false } }) {
         id
         unit
         processingName
         supplierItem {
            id
            name
            prices
         }
      }
   }
`

export const S_SIMPLE_RECIPE_YIELDS = gql`
   subscription SimpleRecipeYields(
      $where: simpleRecipe_simpleRecipeYield_bool_exp
   ) {
      simpleRecipeYields(where: $where) {
         id
         yield
         simpleRecipe {
            id
            name
         }
      }
   }
`

export const S_SIMPLE_PRODUCTS_FROM_RECIPE = gql`
   subscription SimpleProductsFromRecipe(
      $where: products_productOption_bool_exp
      $distinct_on: [products_productOption_select_column!]
   ) {
      productOptions(where: $where, distinct_on: $distinct_on) {
         product {
            id
            name
            assets
         }
      }
   }
`

export const S_SIMPLE_PRODUCTS_FROM_RECIPE_AGGREGATE = gql`
   subscription SimpleProductsFromRecipeAggregate(
      $where: products_productOption_bool_exp
      $distinct_on: [products_productOption_select_column!]
   ) {
      productOptionsAggregate(where: $where, distinct_on: $distinct_on) {
         aggregate {
            count
         }
      }
   }
`

export const S_SIMPLE_RECIPES_FROM_INGREDIENT = gql`
   subscription SimpleRecipesFromIngredients(
      $where: simpleRecipe_simpleRecipe_ingredient_processing_bool_exp
   ) {
      simpleRecipeIngredientProcessings(where: $where) {
         simpleRecipe {
            id
            name
            assets
         }
      }
   }
`

export const S_SIMPLE_RECIPES_FROM_INGREDIENT_AGGREGATE = gql`
   subscription SimpleRecipesFromIngredientsAggregate(
      $where: simpleRecipe_simpleRecipe_ingredient_processing_bool_exp
   ) {
      simpleRecipeIngredientProcessingsAggregate(where: $where) {
         aggregate {
            count
         }
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
export const PRODUCT_OPTIONS = gql`
   subscription ProductOptions {
      productOptions(where: { isArchived: { _eq: false } }) {
         discount
         id
         label
         price
         quantity
         product {
            name
         }
         type
      }
   }
`
export const PRODUCT_EARNING_COUNT = gql`
   subscription PRODUCT_EARNING_COUNT(
      $earningAndCountProductArgs: insights_getEarningByProducts_args!
   ) {
      insights_analytics {
         getEarningsByProducts(args: $earningAndCountProductArgs)
      }
   }
`
export const ORDERS_LIST_BY_PRODUCT = gql`
   subscription ORDERS_LIST_BY_PRODUCT($where: order_order_bool_exp!) {
      orders(
         where: $where
         order_by: { created_at: desc_nulls_last }
         limit: 10
      ) {
         created_at
         customer {
            email
         }
         id
      }
   }
`
export const RECIPE_EARNING = gql`
   subscription RECIPE_EARNING($cartItemWhere: order_cartItem_bool_exp!) {
      cartItemsAggregate(where: $cartItemWhere) {
         aggregate {
            sum {
               unitPrice
            }
         }
      }
   }
`
export const RECIPE_COUNT = gql`
   subscription RECIPE_COUNT($where: order_order_bool_exp!) {
      ordersAggregate(where: $where) {
         aggregate {
            count
         }
      }
   }
`
export const ORDER_BY_RECIPE = gql`
   subscription ORDER_BY_RECIPE($where: order_order_bool_exp!) {
      orders(
         where: $where
         order_by: { created_at: desc_nulls_last }
         limit: 10
      ) {
         id
         customer {
            email
         }
         created_at
      }
   }
`
export const INGREDIENT_ORDER_COUNT = gql`
   subscription INGREDIENT_ORDER_COUNT($where: order_order_bool_exp!) {
      ordersAggregate(where: $where) {
         aggregate {
            count
         }
      }
   }
`
export const SALES_BY_INGREDIENT = gql`
   subscription SALES_BY_INGREDIENT($where: order_cartItem_bool_exp!) {
      cartItemsAggregate(where: $where) {
         aggregate {
            sum {
               unitPrice
            }
         }
      }
   }
`
export const ORDER_LIST_FROM_INGREDIENT = gql`
   subscription ORDER_LIST_FROM_INGREDIENT($where: order_order_bool_exp!) {
      orders(
         where: $where
         limit: 10
         order_by: { created_at: desc_nulls_last }
      ) {
         id
         customer {
            email
         }
         created_at
      }
   }
`
export const OPTIONS_FROM_VEG_NONVEG = gql`
   subscription OPTIONS_FROM_VEG_NONVEG {
      master_vegNonvegType {
         label
      }
   }
`
export const OPTIONS_FROM_RECIPE_COMPONENT = gql`
   subscription OPTIONS_FROM_VEG_NONVEG {
      master_recipeComponent {
         label
      }
   }
`
