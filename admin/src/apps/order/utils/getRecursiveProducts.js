import isEmpty from 'lodash/isEmpty'
import { getTreeViewArray } from '../../../shared/utils'

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

const convertDisplayNameRecursively = products => {
   if (!isEmpty(products)) {
      products.forEach(product => {
         product.displayName = getName(product.displayName)
         if (!isEmpty(product.childNodes)) {
            convertDisplayNameRecursively(product.childNodes)
         }
      })
   }
   return products
}
const getName = displayName => {
   let name = displayName
      .split('->')
      .pop()
      .split('-')
      .pop()
      .split('@@AR@@')
      .shift()
      .trim()

   // remove the last '-' from the product name
   return name.replace(/\-$/, '')
}
const getLabel = product => {
   let label = ''
   if (product.childNodes.length > 0) {
      // checking if the product has a direct childNodes, i.e. if it contains a single productOption
      // then just add the productOption label and show the label also in product name
      // & if the product contains multiple productOptions(for combo products maybe),
      // then just product DisplayName would be fine.
      if (
         product.childNodes.length < 2 &&
         product.childNodes[0].productOption
      ) {
         label = getName(product.childNodes[0].productOption.label)
      }
   }
   console.log('label', label)
   return label
}
export const getRecursiveProducts = (nodes = []) => {
   if (!isEmpty(nodes)) {
      const productsTreeviewData = getTreeViewArray({
         dataset: nodes,
         rootIdKeyName: 'id',
         parentIdKeyName: 'parentCartItemId',
      })
      const products = convertDisplayNameRecursively(productsTreeviewData)

      const refinedProducts = products.map(product => ({
         ...product,
         label: getLabel(product),
         price: getPrice(product),
      }))
      return refinedProducts
   }
   return nodes
}
