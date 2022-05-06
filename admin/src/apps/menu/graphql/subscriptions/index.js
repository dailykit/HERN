import gql from 'graphql-tag'

export const COLLECTIONS_COUNT = gql`
   subscription CollectionsCount {
      collectionsAggregate {
         aggregate {
            count
         }
      }
   }
`

export const S_COLLECTIONS = gql`
   subscription Collections {
      collections: onDemand_collectionDetails(order_by: { created_at: desc }) {
         id
         name
         rrule(path: "text")
         categoriesCount
         productsCount
      }
   }
`

export const S_COLLECTION = gql`
   subscription Collection($id: Int!) {
      collection(id: $id) {
         id
         name
         startTime
         endTime
         rrule
         productCategories(order_by: { position: desc_nulls_last }) {
            id
            position
            productCategoryName
            isActive
            products(order_by: { position: desc_nulls_last }) {
               id
               position
               product {
                  id
                  name
                  assets
               }
            }
         }
      }
   }
`

export const S_PRODUCT_CATEGORIES = gql`
   subscription ProductCategories {
      productCategories {
         id: name
         title: name
      }
   }
`

export const RECURRENCES = gql`
   subscription Recurrence($type: String!) {
      recurrences(where: { type: { _eq: $type } }) {
         id
         rrule
         type
         isActive
         brands(
            where: { isActive: { _eq: true }, brandId: { _is_null: true } }
         ) {
            id
            brand_location {
               id
               location {
                  id
                  label
                  city
               }
            }
         }
         timeSlots {
            id
            from
            to
            isActive
            pickUpLeadTime
            pickUpPrepTime
            mileRanges {
               id
               from
               to
               leadTime
               prepTime
               isActive
               isExcluded
               distanceType
               geoBoundary
               zipcodes
               charges {
                  id
                  charge
                  orderValueFrom
                  orderValueUpto
                  autoDeliverySelection
               }
            }
         }
      }
   }
`

export const BRAND_COLLECTIONS = gql`
   subscription BrandCollections {
      brandCollections: brands {
         id
         title
         domain
         collections {
            collectionId
            isActive
         }
      }
   }
`

export const BRAND_RECURRENCES = gql`
   subscription BrandRecurrences {
      brandRecurrences: brands {
         id
         title
         domain
         recurrences {
            recurrenceId
            isActive
         }
      }
   }
`

export const INVENTORY_PRODUCTS = gql`
   subscription InventoryProducts($where: products_inventoryProduct_bool_exp) {
      inventoryProducts(where: $where) {
         id
         name
         title: name
         assets
         isValid
         isPublished
      }
   }
`

export const SIMPLE_RECIPE_PRODUCTS = gql`
   subscription SimpleRecipeProducts(
      $where: products_simpleRecipeProduct_bool_exp
   ) {
      simpleRecipeProducts(where: $where) {
         id
         name
         title: name
         assets
         isValid
         isPublished
         simpleRecipe {
            id
            name
         }
      }
   }
`

export const CUSTOMIZABLE_PRODUCTS = gql`
   subscription CustomizableProducts(
      $where: products_customizableProduct_bool_exp
   ) {
      customizableProducts(where: $where) {
         id
         name
         title: name
         isValid
      }
   }
`

export const COMBO_PRODUCTS = gql`
   subscription ComboProducts($where: products_comboProduct_bool_exp) {
      comboProducts(where: $where) {
         id
         name
         title: name
         isValid
      }
   }
`
export const BRANDS_BRAND_LOCATIONS = gql`
   subscription Brands_Location {
      brands_brand_location {
         location {
            id
            city
            label
         }
         brand_recurrences {
            isActive
            recurrenceId
         }
         id
         brandId
      }
   }
`
export const BRAND_LOCATIONS = gql`
   subscription BrandLocations($brandId: Int_comparison_exp!) {
      brands_brand_location(where: { brandId: $brandId }) {
         id
         location {
            id
            city
            label
         }
         brand_recurrences {
            isActive
            recurrenceId
         }
      }
   }
`
export const BRAND_LOCATION_RECURRENCES = gql`
   subscription BrandLocationRecurrences($recurrenceId: Int_comparison_exp!) {
      brands(where: { recurrences: { isActive: { _eq: true } } }) {
         id
         title
         brand_locations {
            brand_recurrences(
               where: { recurrenceId: $recurrenceId, isActive: { _eq: true } }
            ) {
               brandId
               brandLocationId
               isActive
            }
         }
      }
   }
`
