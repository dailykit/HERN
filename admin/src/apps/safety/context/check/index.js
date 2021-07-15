import React from 'react'

export const SafetyCheckContext = React.createContext()

export const state = {
   user: undefined,
}

export const reducer = (state, { type, payload }) => {
   switch (type) {
      case 'USER': {
         return {
            ...state,
            user: payload,
         }
      }
      default:
         return state
   }
}
