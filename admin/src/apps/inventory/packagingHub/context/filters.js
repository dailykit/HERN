import React, { useReducer, useContext } from 'react'

const FiltersContext = React.createContext()

const initialState = {
   length: null,
   width: null,
   isFDACompliant: null,
   isRecylable: null,
   isCompostable: null,
   isCompressable: null,
   isInnerWaterResistant: null,
   isOuterWaterResistant: null,
   isInnerGreaseResistant: null,
   isOuterGreaseResistant: null,
}

const reducers = (state, { type, payload }) => {
   switch (type) {
      case 'SELECT_OPTION':
         const { value } = payload
         return { ...state, ...value }

      case 'CLEAR_OPTIONS':
         return {}

      case 'TOGGLE_FDACOMPLIANT':
         return { ...state, isFDACompliant: payload.value ? null : true }

      case 'TOGGLE_RECYLABLE':
         return { ...state, isRecylable: payload.value ? null : true }

      case 'TOGGLE_COMPOSTABLE':
         return { ...state, isCompostable: payload.value ? null : true }

      case 'TOGGLE_COMPRESSABLE':
         return { ...state, isCompressable: payload.value ? null : true }

      case 'TOGGLE_WATER_RESITANCE':
         const { isInnerWaterResistant } = payload.value
         const waterResistanceValue = isInnerWaterResistant ? null : true

         return {
            ...state,
            isInnerWaterResistant: waterResistanceValue,
            isOuterWaterResistant: waterResistanceValue,
         }

      case 'TOGGLE_INNER_WATER_RESISTANCE':
         return { ...state, isInnerWaterResistant: payload.value ? null : true }

      case 'TOGGLE_OUTER_WATER_RESISTANCE':
         return { ...state, isOuterWaterResistant: payload.value ? null : true }

      case 'TOGGLE_GREASE_RESITANCE':
         const { isInnerGreaseResistant } = payload.value
         const greaseResistanceValue = isInnerGreaseResistant ? null : true

         return {
            ...state,
            isInnerGreaseResistant: greaseResistanceValue,
            isOuterGreaseResistant: greaseResistanceValue,
         }

      case 'TOGGLE_OUTER_GREASE_RESISTANCE':
         return {
            ...state,
            isOuterGreaseResistant: payload.value ? null : true,
         }

      case 'TOGGLE_INNER_GREASE_RESISTANCE':
         return {
            ...state,
            isInnerGreaseResistant: payload.value ? null : true,
         }

      default:
         return state
   }
}

export default function FiltersProvider({ children }) {
   const [state, dispatch] = useReducer(reducers, initialState)

   return (
      <FiltersContext.Provider
         value={{
            filters: state,
            dispatch,
         }}
      >
         {children}
      </FiltersContext.Provider>
   )
}

export const useFilters = () => useContext(FiltersContext)
