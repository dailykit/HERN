import React from 'react'

export const RecurrenceContext = React.createContext()

export const state = {
   recurrenceId: undefined,
   timeSlotId: undefined,
   mileRangeId: undefined,
   charge: undefined,
}

export const reducers = (state, { type, payload }) => {
   switch (type) {
      case 'RECURRENCE': {
         return {
            ...state,
            recurrenceId: payload,
         }
      }
      case 'TIME_SLOT': {
         return {
            ...state,
            timeSlotId: payload,
         }
      }
      case 'MILE_RANGE': {
         return {
            ...state,
            mileRangeId: payload,
         }
      }
      case 'CHARGE': {
         return {
            ...state,
            charge: payload,
         }
      }
      default:
         return state
   }
}
