import React from 'react'

export const IngredientContext = React.createContext()

export const state = {
   processingIndex: 0,
   sachetIndex: 0,
   realTime: {
      isPublished: true,
      isLive: false,
      labelTemplate: undefined,
      bulkItem: undefined,
      sachetItem: undefined,
      station: undefined,
      packaging: undefined,
      accuracy: 0,
      operationConfig: undefined,
   },
   plannedLot: {
      isPublished: true,
      isLive: false,
      labelTemplate: undefined,
      bulkItem: undefined,
      sachetItem: undefined,
      station: undefined,
      packaging: undefined,
      accuracy: 0,
      operationConfig: undefined,
   },
   currentMode: undefined,
   editMode: undefined,
   itemType: null,
   sachetId: null,
}

export const reducers = (state, { type, payload }) => {
   switch (type) {
      case 'PROCESSING_INDEX': {
         return {
            ...state,
            processingIndex: payload,
            sachetIndex: 0,
         }
      }
      case 'SACHET_INDEX': {
         return {
            ...state,
            sachetIndex: payload,
         }
      }
      case 'MODE': {
         return {
            ...state,
            [payload.mode]: {
               ...state[payload.mode],
               [payload.name]: payload.value,
            },
         }
      }
      case 'CLEAN': {
         return {
            ...state,
            realTime: {
               isPublished: true,
               isLive: false,
               station: undefined,
               labelTemplate: undefined,
               bulkItem: undefined,
               sachetItem: undefined,
               station: undefined,
               packaging: undefined,
               accuracy: 0,
            },
            plannedLot: {
               isPublished: true,
               isLive: false,
               station: undefined,
               labelTemplate: undefined,
               bulkItem: undefined,
               sachetItem: undefined,
               station: undefined,
               packaging: undefined,
               accuracy: 0,
            },
            currentMode: undefined,
         }
      }
      case 'CURRENT_MODE': {
         return {
            ...state,
            currentMode: payload,
         }
      }
      case 'EDIT_MODE': {
         return {
            ...state,
            editMode: payload,
         }
      }
      case 'ITEM_TYPE': {
         return {
            ...state,
            itemType: payload,
         }
      }
      case 'SACHET_ID': {
         return {
            ...state,
            sachetId: payload,
         }
      }
      default:
         return state
   }
}
