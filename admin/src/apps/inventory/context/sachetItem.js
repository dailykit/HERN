import React from 'react'

export const SupplierItemContext = React.createContext()

export const initialState = {
   sachetItemId: null,
}

export const reducer = (state = initialState, { type, payload }) => {
   switch (type) {
      case 'SACHET_ITEM_ID': {
         return {
            ...state,
            sachetItemId: payload,
         }
      }
      default:
         return state
   }
}

export const SupplierItemProvider = ({ children }) => {
   const [supplierState, supplierDispatch] = React.useReducer(
      reducer,
      initialState
   )

   return (
      <SupplierItemContext.Provider value={{ supplierState, supplierDispatch }}>
         {children}
      </SupplierItemContext.Provider>
   )
}
