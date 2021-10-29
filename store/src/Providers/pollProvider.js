import React from 'react'

const PollContext = React.createContext()

const initialState = {
   experienceClasses: [],
   classDates: [],
   pollPriceBreakDown: {},
   pollClassTypeInfo: {},
   pollType: 'private',
   selectedPollSlot: {},
   pollingStepsIndex: 0,
   isAllSlotsBooked: false,
   pollOptions: [],
   cutoffDate: null
}

const reducers = (state, { type, payload }) => {
   switch (type) {
      case 'UPDATE_POLL_INFO': {
         const newState = {
            ...state,
            ...payload
         }
         return newState
      }

      case 'INCREMENT_POLLING_STEP': {
         const newState = {
            ...state,
            pollingStepsIndex: payload + 1
         }
         return newState
      }

      case 'DECREMENT_POLLING_STEP': {
         const newState = {
            ...state,
            pollingStepsIndex: payload - 1
         }
         return newState
      }
      case 'ADD_TO_POLL_OPTIONS': {
         const newState = {
            ...state,
            pollOptions: [...state.pollOptions, payload]
         }
         return newState
      }
      case 'REMOVE_FROM_POLL_OPTIONS': {
         const updatedPollOptions = state.pollOptions
         updatedPollOptions.splice(payload, 1)
         const newState = {
            ...state,
            pollOptions: [...updatedPollOptions]
         }
         return newState
      }
      default:
         return state
   }
}

export const PollProvider = ({ children }) => {
   const [state, dispatch] = React.useReducer(reducers, initialState)

   const updatePollInfo = data => {
      dispatch({
         type: 'UPDATE_POLL_INFO',
         payload: data
      })
   }

   const addToPollOptions = data => {
      dispatch({
         type: 'ADD_TO_POLL_OPTIONS',
         payload: data
      })
   }
   const removeFromPollOptions = index => {
      dispatch({
         type: 'REMOVE_FROM_POLL_OPTIONS',
         payload: index
      })
   }

   const nextPollingSteps = currentIndex => {
      dispatch({
         type: 'INCREMENT_POLLING_STEP',
         payload: currentIndex
      })
   }

   const previousPollingSteps = currentIndex => {
      dispatch({
         type: 'DECREMENT_POLLING_STEP',
         payload: currentIndex
      })
   }

   return (
      <PollContext.Provider
         value={{
            state,
            dispatch,
            updatePollInfo,
            nextPollingSteps,
            previousPollingSteps,
            addToPollOptions,
            removeFromPollOptions
         }}
      >
         {children}
      </PollContext.Provider>
   )
}

export const usePoll = () => React.useContext(PollContext)
