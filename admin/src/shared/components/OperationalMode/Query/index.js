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
   subscription MyQuery($brandId: Int!) {
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
         productPrice_brand_locations(where: { brandId: { _eq: 1 } }) {
            specificPrice
            specificDiscount
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
