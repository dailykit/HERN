import isEmpty from 'lodash/isEmpty'
import { getTreeViewArray } from '../../../shared/utils'
function removeKeys(obj, keys) {
   for (var property in obj) {
      if (obj.hasOwnProperty(property)) {
         if (
            typeof obj[property] == 'object' &&
            Array.isArray(obj[property]) &&
            obj[property].length > 0
         ) {
            obj[property].forEach(item => {
               removeKeys(item, keys)
            })
         } else if (typeof obj[property] == 'object') {
            removeKeys(obj[property], keys)
         } else {
            if (keys.includes(property) && obj.parentCartItemId) {
               delete obj[property]
            }
         }
      }
   }
}
const getPrice = product => {
   let totalPrice = 0
   const price = product => {
      if (!isEmpty(product)) {
         totalPrice += product.unitPrice
         if (!isEmpty(product.childNodes)) {
            product.childNodes.forEach(product => {
               price(product)
            })
         }
      }
   }
   price(product)
   return totalPrice.toFixed(2)
}
export const combineCartItems = (nodes = []) => {
   if (!isEmpty(nodes)) {
      const productsTreeviewData = getTreeViewArray({
         dataset: nodes,
         rootIdKeyName: 'id',
         parentIdKeyName: 'parentCartItemId',
      })

      const updatedProductsTreeViewData = productsTreeviewData.map(prod => {
         const updatedProd = prod
         removeKeys(updatedProd, ['id', 'parentCartItemId', 'created_at'])
         return updatedProd
      })
      const refinedProducts = updatedProductsTreeViewData.map(product => ({
         ...product,
         displayName:
            product.childNodes.length > 0
               ? `${product.childNodes[0].displayName
                    .split('->')
                    .pop()
                    .split('@@AR@@')
                    .shift()
                    .trim()}-${product.childNodes[0].displayName
                    .split('->')
                    .pop()
                    .split('-')
                    .pop()
                    .split('@@AR@@')
                    .shift()
                    .trim()}`
               : product.displayName
                    .split('->')
                    .pop()
                    .split('-')
                    .pop()
                    .split('@@AR@@')
                    .shift()
                    .trim(),
         quantity: product.ids.length,
         price: getPrice(product),
      }))
      return {
         refinedProducts,
      }
   }
   return nodes
}
