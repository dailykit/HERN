export const CREATE_ORDER = `
   mutation createOrder($object: order_order_insert_input!) {
      createOrder(object: $object) {
         id
         deliveryInfo
      }
   }
`

export const CREATE_ORDER_INVENTORY_PRODUCT = `
   mutation createOrderInventoryProduct($object: order_orderInventoryProduct_insert_input!){
      createOrderInventoryProduct(object: $object) {
         id
      }
   }
`

export const CREATE_ORDER_MEALKIT_PRODUCT = `
   mutation createOrderMealKitProduct($object: order_orderMealKitProduct_insert_input!){
      createOrderMealKitProduct(object: $object) {
         id
      }
   }
`

export const CREATE_ORDER_READY_TO_EAT_PRODUCT = `
   mutation createOrderReadyToEatProduct($object: order_orderReadyToEatProduct_insert_input!){
      createOrderReadyToEatProduct(object: $object) {
         id
      }
   }
`

export const CREATE_ORDER_SACHET = `
   mutation createOrderSachet($object: order_orderSachet_insert_input!){
      createOrderSachet(object: $object){
         id
      }
   }
`

export const UPDATE_CART = `
   mutation updateCart($id: Int!, $_set: order_cart_set_input!) {
      updateCart(where: { id: { _eq: $id } }, _set: $_set) {
         returning {
            id
         }
      }
   }
`

export const UPDATE_ORDER = `
   mutation updateOrder($id: oid!, $_set: order_order_set_input!) {
      updateOrder(pk_columns: {id: $id}, _set: $_set) {
         id
      }
   }
`

export const SEND_MAIL = `
   mutation sendEmail($emailInput: EmailInput!) {
      sendEmail(emailInput: $emailInput) {
         message
         success
      }
   }
`
