import gql from 'graphql-tag'

export const CREATE_SUPPLIER = gql`
   mutation CreateSupplier($object: inventory_supplier_insert_input!) {
      createSupplier(objects: [$object]) {
         returning {
            id
            name
         }
      }
   }
`

export const UPDATE_SUPPLIER = gql`
   mutation UpdateSupplier($id: Int, $object: inventory_supplier_set_input) {
      updateSupplier(where: { id: { _eq: $id } }, _set: $object) {
         returning {
            id
            name
         }
      }
   }
`

export const DELETE_SUPPLIER = gql`
   mutation DeleteSupplier($id: Int) {
      deleteSupplier(where: { id: { _eq: $id } }) {
         affected_rows
         returning {
            name
         }
      }
   }
`
