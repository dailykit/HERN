import React from 'react'

export const RecipeContext = React.createContext()

export const state = {
   newIngredient: undefined,
   serving: undefined,
   stage: 0,
   sachetAddMeta: {
      yieldId: null,
      ingredientProcessingRecordId: null,
      ingredientId: null,
      processingId: null,
   },
}

export const reducers = (state, { type, payload }) => {
   switch (type) {
      case 'UPSERT_SACHET': {
         return {
            ...state,
            sachetAddMeta: payload,
         }
      }
      case 'ADD_INGREDIENT': {
         return {
            ...state,
            newIngredient: payload,
         }
      }
      default:
         return state
   }
}
