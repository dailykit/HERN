import gql from 'graphql-tag'

export const BRAND_LIST = gql`
   subscription brandId($identifier: String!) {
      brandsAggregate(order_by: { title: asc }) {
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
