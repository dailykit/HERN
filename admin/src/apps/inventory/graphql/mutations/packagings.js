import gql from 'graphql-tag'

export const CREATE_PACKAGING = gql`
   mutation CreatePackaging($object: packaging_packaging_insert_input!) {
      createPackaging(objects: [$object]) {
         returning {
            id
            packagingName: name
         }
      }
   }
`
export const UPDATE_PACKAGING = gql`
   mutation UpdatePackaging($id: Int!, $object: packaging_packaging_set_input) {
      updatePackaging(where: { id: { _eq: $id } }, _set: $object) {
         affected_rows
      }
   }
`

export const UPDATE_PACKAGING_SPECS = gql`
   mutation UpdateSpecs(
      $id: Int!
      $object: packaging_packagingSpecifications_set_input
   ) {
      update_packaging_packagingSpecifications(
         where: { id: { _eq: $id } }
         _set: $object
      ) {
         affected_rows
      }
   }
`
