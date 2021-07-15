import React from 'react'

export const ModifiersContext = React.createContext()

export const initialState = {
   modifierId: null,
   optionId: null,
   categoryId: null,
   optionType: null,
   modifierName: null,
}
export const reducers = (state = initialState, { type, payload }) => {
   switch (type) {
      case 'MODIFIER_ID': {
         return { ...state, modifierId: payload }
      }
      case 'MODIFIER_NAME': {
         return { ...state, modifierName: payload }
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
