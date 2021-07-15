import gql from 'graphql-tag'

export const UPDATE_PURCHASE_ORDER = gql`
   mutation UpdatePurchaseOrderItem($id: Int!, $status: String!) {
      updatePurchaseOrderItem(
         where: { id: { _eq: $id } }
         _set: { status: $status }
      ) {
         returning {
            id
            status
         }
      }
   }
`

export const CREATE_PURCHASE_ORDER = gql`
   mutation CreatePurchaseOrder {
      item: insert_inventory_purchaseOrderItem_one(
         object: { type: "PACKAGING" }
      ) {
         id
         type
      }
   }
`
export const CREATE_ITEM_PURCHASE_ORDER = gql`
   mutation CreatePurchaseOrder {
      item: insert_inventory_purchaseOrderItem_one(
         object: { type: "SUPPLIER_ITEM" }
      ) {
         id
         type
      }
   }
`

export const UPDATE_PURCHASE_ORDER_ITEM = gql`
   mutation UpdatePurchaseOrdetItem(
      $id: Int!
      $set: inventory_purchaseOrderItem_set_input
   ) {
      updatePurchaseOrderItem(where: { id: { _eq: $id } }, _set: $set) {
         affected_rows
      }
   }
`
