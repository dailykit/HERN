import gql from 'graphql-tag'

export const INVENTORY_BUNDLES = {
   CREATE: gql`
      mutation CreateInventoryProductBundle(
         $object: products_inventoryProductBundle_insert_input!
      ) {
         createInventoryProductBundle(object: $object) {
            id
         }
      }
   `,
   UPDATE: gql`
      mutation UpdateInventoryProductBundle(
         $id: Int!
         $_set: products_inventoryProductBundle_set_input
      ) {
         updateInventoryProductBundle(pk_columns: { id: $id }, _set: $_set) {
            id
         }
      }
   `,
   VIEW: gql`
      subscription InventoryProductBundle($id: Int!) {
         inventoryProductBundle(id: $id) {
            id
            label
            inventoryProductBundleSachets {
               id
               sachetItem {
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
         }
      }
   `,
   VIEW_ALL: gql`
      subscription InventoryProductBundles {
         inventoryProductBundles {
            id
            label
            title: label
         }
      }
   `,
}

export const INVENTORY_BUNDLE_SACHETS = {
   CREATE: gql`
      mutation CreateInventoryProductBundleSachet(
         $object: products_inventoryProductBundleSachet_insert_input!
      ) {
         createInventoryProductBundleSachet(object: $object) {
            id
         }
      }
   `,
   DELETE: gql`
      mutation DeleteInventoryProductBundleSachet($id: Int!) {
         deleteInventoryProductBundleSachet(id: $id) {
            id
         }
      }
   `,
}
