import React from 'react'

export const CollectionContext = React.createContext()

export const state = {
   productType: 'simple',
   categoryId: undefined,
}

export const reducer = (state, { type, payload }) => {
   switch (type) {
      case 'PRODUCT_TYPE': {
         return {
            ...state,
            productType: payload.productType,
         }
      }
      case 'CATEGORY_ID': {
         return {
            ...state,
            categoryId: payload.categoryId,
         }
      }
      default:
         return state
   }
}
