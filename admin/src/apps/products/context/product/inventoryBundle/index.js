import React from 'react'

export const InventoryBundleContext = React.createContext()

export const initialState = {
   bundleId: null,
   bundleItemType: null,
   label: null,
}

export const reducers = (state = initialState, { type, payload }) => {
   switch (type) {
      case 'BUNDLE_ID': {
         return { ...state, bundleId: payload }
      }
      case 'BUNDLE_ITEM_TYPE': {
         return { ...state, bundleItemType: payload }
      }
      case 'LABEL': {
         return { ...state, label: payload }
      }
      default:
         return state
   }
}

export const InventoryBundleProvider = ({ children }) => {
   const [bundleState, bundleDispatch] = React.useReducer(
      reducers,
      initialState
   )

   return (
      <InventoryBundleContext.Provider value={{ bundleState, bundleDispatch }}>
         {children}
      </InventoryBundleContext.Provider>
   )
}
