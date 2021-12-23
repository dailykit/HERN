import gql from 'graphql-tag'

export const BRAND_ID = gql`
   subscription brandId {
      brandsAggregate(
         order_by: { id: asc }
         where: { isArchived: { _eq: false } }
      ) {
         nodes {
            title
            id
         }
      }
   }
`
export const COLLECTION_PRODUCTS = gql`
   subscription collectionProduct(
      $brandId: Int!
      $brandId1: Int!
      $brand_locationId: Int!
   ) {
      products {
         id
         name
         price
         discount
         collection_categories(
            where: {
               collection_productCategory: {
                  collection: { brands: { brandId: { _eq: $brandId } } }
               }
            }
            limit: 1
         ) {
            collection_productCategory {
               productCategoryName
            }
         }
         productPrice_brand_locations(
            where: {
               brandId: { _eq: $brandId1 }
               brand_locationId: { _eq: $brand_locationId }
            }
         ) {
            specificPrice
            specificDiscount
            markupOnStandardPriceInPercentage
            isPublished
            isAvailable
            id
         }
      }
   }
`

export const BRANDS_LOCATION_ID = gql`
   subscription brandLocationId($where: brands_brand_bool_exp!) {
      brandsAggregate(order_by: { id: asc }, where: $where) {
         nodes {
            id
            brand_locations {
               id
            }
         }
      }
   }
`
export const PRODUCT_PRICE_BRAND_LOCATION = gql`
   mutation brandManager(
      $objects: [products_productPrice_brand_location_insert_input!]!
      $constraint: products_productPrice_brand_location_constraint!
      $update_columns: [products_productPrice_brand_location_update_column!]!
   ) {
      insert_products_productPrice_brand_location(
         objects: $objects
         on_conflict: {
            constraint: $constraint
            update_columns: $update_columns
         }
      ) {
         affected_rows
      }
   }
`
export const RESET_BRAND_MANAGER = gql`
   mutation MyMutation($where: products_productPrice_brand_location_bool_exp!) {
      delete_products_productPrice_brand_location(where: $where) {
         affected_rows
      }
   }
`
