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
   subscription collectionProduct($brandId: Int!, $brandId1: Int!) {
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
         productPrice_brand_locations(where: { brandId: { _eq: $brandId1 } }) {
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
   subscription brandLocationId {
      brands_brand_location {
         brandId
         id
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
