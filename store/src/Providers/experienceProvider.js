import React from 'react'
import { useQuery } from '@apollo/client'
import { useToasts } from 'react-toast-notifications'
import { EXPERIENCE_CLASS_INFO } from '../graphql'
import { getAvailableSlots, isExpired } from '../utils'
import { usePoll } from './pollProvider'

const ExperienceContext = React.createContext()

const initialState = {
   experience: {},
   experienceClasses: [],
   classDates: [],
   priceBreakDown: {},
   classTypeInfo: {},
   participants: 1,
   pricePerPerson: 0,
   bookingType: 'private',
   selectedSlot: {},
   kit: 0,
   totalPrice: 0,
   totalKitPrice: 0,
   isHostParticipant: true,
   isKitAdded: false,
   isLoyaltyPointUsed: false,
   isWalletAmountUsed: false,
   priceBreakDownDrawer: false,
   onSummaryStep: false,
   bookingStepsIndex: 0,
   kitPrice: 5,
   deliveryCharge: 0,
   salesTax: 0,
   loyaltyPoints: 0,
   walletAmount: 0,
   isAllSlotsBooked: false,
   experienceBookingDetails: null //bookingInfo in case we booking from poll option
}

const reducers = (state, { type, payload }) => {
   switch (type) {
      case 'SET_INITIAL_EXPERIENCE_INFO': {
         const newState = {
            ...state,
            ...payload
         }
         return newState
      }
      case 'UPDATE_EXPERIENCE_INFO': {
         const newState = {
            ...state,
            ...payload
         }
         console.log('UPDATE', payload, newState)
         return newState
      }
      case 'INCREMENT_BOOKING_STEP': {
         const newState = {
            ...state,
            bookingStepsIndex: payload + 1
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
      case 'DECREMENT_BOOKING_STEP': {
         const newState = {
            ...state,
            bookingStepsIndex: payload - 1
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
      case 'TOGGLE_DETAIL_BREAKDOWN': {
         const newState = {
            ...state,
            priceBreakDownDrawer: payload
         }
         return newState
      }

      default:
         return state
   }
}

export const ExperienceProvider = ({ children }) => {
   const [experienceId, setExperienceId] = React.useState(null)
   // const { experienceId } = useParams();
   const { addToast } = useToasts()
   const { updatePollInfo } = usePoll()
   const [isLoading, setIsLoading] = React.useState(true)
   const [state, dispatch] = React.useReducer(reducers, initialState)
   useQuery(EXPERIENCE_CLASS_INFO, {
      skip: !experienceId,
      variables: {
         experienceId: experienceId
      },
      onCompleted: async ({ privateClassType, publicClassType }) => {
         console.log('privateClassType', privateClassType)
         let initialDispatchData = {}
         let initialPollData = {}
         let experienceClasses = privateClassType
         if (publicClassType.length) {
            initialDispatchData = {
               bookingType: 'public'
            }
            initialPollData = {
               pollType: 'public'
            }
            experienceClasses = publicClassType
         } else {
            initialDispatchData = {
               bookingType: 'private'
            }
            initialPollData = {
               pollType: 'private'
            }
            experienceClasses = privateClassType
         }

         // const experienceClasses = experienceClasses.filter(
         //   (cls) => cls?.isActive === true && cls?.isBooked === false
         // );

         const availableSlots = await getAvailableSlots(experienceClasses)

         // initially first non booked class will be selected by default
         const initialDefaultClass = experienceClasses.find(
            expClass =>
               !expClass.isBooked &&
               !isExpired(expClass?.startTimeStamp, new Date())
         )

         // initially first non-book slot will be selected by default
         const initialDefaultSlotObject = availableSlots.find(obj =>
            obj.slots.some(slot => !slot.isBooked)
         )

         const initialDefaultSlot = initialDefaultSlotObject?.slots.find(
            slot => !slot.isBooked
         )

         if (experienceClasses.length) {
            initialDispatchData = {
               ...initialDispatchData,

               experienceClasses: experienceClasses,
               experience: experienceClasses[0].experience,
               classDates: availableSlots,
               selectedSlot: {
                  date: initialDefaultSlotObject?.date,
                  time: initialDefaultSlot?.time,
                  selectedExperienceClassId: initialDefaultSlot?.id
               },
               priceBreakDown: initialDefaultClass?.classTypeInfo?.priceRanges,
               classTypeInfo: initialDefaultClass?.classTypeInfo,
               totalPrice:
                  initialDefaultClass?.classTypeInfo?.minimumBookingAmount,
               pricePerPerson:
                  initialDefaultClass?.classTypeInfo?.minimumBookingAmount /
                  initialDefaultClass?.classTypeInfo?.minimumParticipant
            }
            initialPollData = {
               ...initialPollData,
               experienceClasses: experienceClasses,
               classDates: availableSlots,
               selectedPollSlot: {
                  date: initialDefaultSlotObject?.date,
                  time: initialDefaultSlot?.time,
                  selectedExperienceClassId: initialDefaultSlot?.id
               },
               pollPriceBreakDown:
                  initialDefaultClass?.classTypeInfo?.priceRanges,
               pollClassTypeInfo: initialDefaultClass?.classTypeInfo
            }
         } else {
            initialDispatchData = {
               isAllSlotsBooked: experienceClasses.every(
                  expClass => expClass.isBooked
               )
            }
            initialPollData = {
               isAllSlotsBooked: experienceClasses.every(
                  expClass => expClass.isBooked
               )
            }
         }

         //dispatching the initialDispatchData to set initialState for experience info
         dispatch({
            type: 'SET_INITIAL_EXPERIENCE_INFO',
            payload: initialDispatchData
         })
         updatePollInfo(initialPollData)
         setIsLoading(false)
      },

      onError: error => {
         addToast('Opps! Something went wrong!', { appearance: 'error' })
         console.log(error)
         setIsLoading(false)
      }
   })

   const updateExperienceInfo = data => {
      console.log('price update>>>>>>', data)
      dispatch({
         type: 'UPDATE_EXPERIENCE_INFO',
         payload: data
      })
   }

   const nextBookingSteps = currentIndex => {
      dispatch({
         type: 'INCREMENT_BOOKING_STEP',
         payload: currentIndex
      })
   }

   const previousBookingSteps = currentIndex => {
      dispatch({
         type: 'DECREMENT_BOOKING_STEP',
         payload: currentIndex
      })
   }

   const toggleDetailBreakdown = data => {
      dispatch({
         type: 'TOGGLE_DETAIL_BREAKDOWN',
         payload: data
      })
   }

   return (
      <ExperienceContext.Provider
         value={{
            state,
            isLoading,
            dispatch,
            setExperienceId,
            updateExperienceInfo,
            nextBookingSteps,
            previousBookingSteps,
            toggleDetailBreakdown
         }}
      >
         {children}
      </ExperienceContext.Provider>
   )
}

export const useExperienceInfo = () => React.useContext(ExperienceContext)
