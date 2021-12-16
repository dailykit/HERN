import _ from 'lodash'

//used for combine products which have same product, product option and modifiers
export const combineCartItems = cartItems => {
   if (!cartItems || !cartItems.length) {
      return []
   }

   const cartItemRootIds = cartItems.map(item => item.cartItemId)
   const cartItemsWithoutId = cartItems.map(item => {
      const updatedItem = item
      delete updatedItem.cartItemId
      delete updatedItem.created_at
      return updatedItem
   })

   const combinedItems = []
   cartItemsWithoutId.forEach((item, index) => {
      let found = false
      for (const combinedItem of combinedItems) {
         const combinedItemIds = combinedItem.ids
         const newCombinedItem = _.omit(combinedItem, 'ids')

         if (_.isEqual(newCombinedItem, item)) {
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

   return combinedItems
}
