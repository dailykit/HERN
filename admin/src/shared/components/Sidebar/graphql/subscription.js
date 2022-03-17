import gql from 'graphql-tag'

export const BRAND_LIST = gql`
   subscription brandId($identifier: String!, $id: Int!) {
      brandsAggregate(order_by: { title: asc }, where: { id: { _eq: $id } }) {
         aggregate {
            count
         }
         nodes {
            title
            id
            domain
            isDefault
            brand_brandSettings(
               where: { brandSetting: { identifier: { _eq: $identifier } } }
            ) {
               value
            }
         }
      }
   }
`
export const BRAND_LOCATIONS = gql`
   subscription brandLocationId($id: Int!) {
      brands(where: { id: { _eq: $id } }) {
         brand_locations {
            locationId
            location {
               label
            }
         }
      }
   }
`
export const LOCATION_SELECTOR_LIST = gql`
   subscription brandId($identifier: String!) {
      brandsAggregate(order_by: { id: asc }) {
         aggregate {
            count
         }
         nodes {
            title
            id
            domain
            isDefault
            brand_brandSettings(
               where: { brandSetting: { identifier: { _eq: $identifier } } }
            ) {
               value
            }
            brand_locations {
               location {
                  id
                  label
               }
            }
         }
      }
   }
`
