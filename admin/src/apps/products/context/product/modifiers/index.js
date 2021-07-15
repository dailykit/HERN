import React from 'react'

export const ModifiersContext = React.createContext()

export const initialState = {
   modifierId: null,
   optionId: null,
   categoryId: null,
   optionType: null,
}

export const reducers = (state = initialState, { type, payload }) => {
   switch (type) {
      case 'MODIFIER_ID': {
         return { ...state, modifierId: payload }
      }
      case 'OPTION_ID': {
         return { ...state, optionId: payload }
      }
      case 'CATEGORY_ID': {
         return { ...state, categoryId: payload }
      }
      case 'OPTION_TYPE': {
         return { ...state, optionType: payload }
      }
      default:
         return state
   }
}

export const ModifiersProvider = ({ children }) => {
   const [modifiersState, modifiersDispatch] = React.useReducer(
      reducers,
      initialState
   )

   return (
      <ModifiersContext.Provider value={{ modifiersState, modifiersDispatch }}>
         {children}
      </ModifiersContext.Provider>
   )
}
