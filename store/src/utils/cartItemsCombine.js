// import _ from 'lodash'
import isEqual from 'lodash/isEqual'
import omit from 'lodash/omit'

//used for combine products which have same product, product option and modifiers
export const combineCartItems = cartItems => {
   if (!cartItems || !cartItems.length) {
      return []
   }

   const cartItemRootIds = cartItems.map(item => item.cartItemId)
   const cartItemsWithoutId = cartItems.map(item => {
      const updatedItem = JSON.parse(JSON.stringify(item))
      // delete updatedItem.cartItemId
      //delete updatedItem.created_at
      return updatedItem
   })

   const combinedItems = []
   cartItemsWithoutId.forEach((item, index) => {
      let found = false
      for (const combinedItem of combinedItems) {
         const combinedItemIds = combinedItem.ids
         const newCombinedItem = omit(combinedItem, [
            'ids',
            'cartItemId',
            'created_at',
         ])
         const cartItem = omit(item, ['cartItemId', 'created_at'])
         if (isEqual(newCombinedItem, cartItem)) {
            combinedItem.ids = [...combinedItemIds, cartItemRootIds[index]]
            found = true
            break
         } else {
            combinedItem.ids = combinedItemIds
         }
      }
      if (!found) {
         combinedItems.push({
            ...item,
            ids: [cartItemRootIds[index]],
         })
      }
   })
   const sortedCombinedItems = combinedItems.sort(
      (item1, item2) => item1.created_at - item2.created_at
   )
   return sortedCombinedItems
}
