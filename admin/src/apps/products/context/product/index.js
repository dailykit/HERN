import React from 'react'

export const ProductContext = React.createContext()

export const initialState = {
   productOptionType: '',
   optionId: null,
   productType: '',
}

export const reducer = (state = initialState, { type, payload }) => {
   switch (type) {
      case 'PRODUCT_OPTION_TYPE': {
         return {
            ...state,
            productOptionType: payload,
         }
      }
      case 'OPTION_ID': {
         return {
            ...state,
            optionId: payload,
         }
      }
      case 'PRODUCT_TYPE': {
         return { ...state, productType: payload }
      }
      default:
         return state
   }
}

export const ProductProvider = ({ children }) => {
   const [productState, productDispatch] = React.useReducer(
      reducer,
      initialState
   )

   return (
      <ProductContext.Provider value={{ productState, productDispatch }}>
         {children}
      </ProductContext.Provider>
   )
}
