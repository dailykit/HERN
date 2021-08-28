import gql from 'graphql-tag'

export const BRANDS = gql`
   subscription BRANDS {
      brands(where: { isArchived: { _eq: false } }, order_by: { title: asc }) {
         title
         isDefault
         brandId: id
      }
   }
`
