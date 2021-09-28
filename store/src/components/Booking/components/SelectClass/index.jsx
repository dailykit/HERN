import React, { useState, useEffect, useRef, useMemo } from 'react'
import { Flex } from '@dailykit/ui'
import { Wrapper, Popup } from './styles'
import DateRange from '../DateRange'
import Participant from '../Participant'
import PriceBreakDown from '../PriceBreakDown'
import SelectParticipant from '../SelectParticipant'
import { useCustomMutation } from '../../useCustomMutation'
import AvailableDate from '../../../AvailableDate'
import { ChevronUp, ChevronDown } from '../../../Icons'
import { theme } from '../../../../theme'
import { isEmpty, omitDate } from '../../../../utils'
import {
   useExperienceInfo,
   useCart,
   useProduct,
   useUser,
   usePoll
} from '../../../../Providers'

export default function SelectClass({ experienceId, isMulti = false }) {
   const node = useRef()
   const { state: userState } = useUser()
   const { state: productState } = useProduct()
   const { selectedProductOption = {}, cartItems = [] } = productState
   const {
      user: {
         defaultCustomerAddress,
         keycloakId,
         defaultPaymentMethodId,
         stripeCustomerId
      }
   } = userState
   const {
      state,
      updateExperienceInfo,
      toggleDetailBreakdown,
      nextBookingSteps
   } = useExperienceInfo()
   const { CART, EXPERIENCE_BOOKING } = useCustomMutation()
   const { getCart } = useCart()
   const cart = getCart(experienceId)
   const {
      bookingType,
      bookingStepsIndex,
      participants,
      classDates,
      selectedSlot,
      priceBreakDownDrawer,
      experienceClasses,
      isHostParticipant,
      classTypeInfo
   } = useMemo(() => {
      return state
   }, [state])

   const {
      state: pollState,
      updatePollInfo,
      addToPollOptions,
      removeFromPollOptions
   } = usePoll()
   const { pollOptions } = pollState

   const typeHandler = async type => {
      updateExperienceInfo({
         bookingType: type
      })
   }

   const btnSelectionHandler = async info => {
      if (isMulti) {
         const pollOptionIndex = pollOptions.findIndex(
            option =>
               option.selectedExperienceClassId ===
               info.selectedExperienceClassId
         )
         if (pollOptionIndex !== -1) {
            removeFromPollOptions(pollOptionIndex)
         } else {
            addToPollOptions(info)
         }
      } else {
         const result = experienceClasses.find(
            cls => cls?.id === info?.selectedExperienceClassId
         )
         if (result !== undefined) {
            await updateExperienceInfo({
               selectedSlot: info,
               classTypeInfo: result?.classTypeInfo,
               priceBreakDown: result?.classTypeInfo?.priceRanges
            })
            nextBookingSteps(bookingStepsIndex)
         }
      }
   }

   const handleClick = e => {
      if (node.current.contains(e.target)) {
         // inside click
         return
      }
      // outside click
      toggleDetailBreakdown(false)
   }

   useEffect(() => {
      document.addEventListener('mousedown', handleClick)

      return () => {
         document.removeEventListener('mousedown', handleClick)
      }
   }, [])

   return (
      <Wrapper>
         <h2 className="top-heading">Booking Experience</h2>
         <h2 className="heading">
            From $38<span>/person</span>
         </h2>
         <div style={{ position: 'relative' }}>
            <button
               className="breakdown-head"
               onClick={() => toggleDetailBreakdown(prev => !prev)}
            >
               Detailed Breakdown
            </button>
            <Popup show={priceBreakDownDrawer}>
               <div className="pointer" />
               <PriceBreakDown />
            </Popup>
         </div>
         <div className="sticky-container">
            <div className="select-option" ref={node}>
               <div style={{ flex: '1' }}>
                  <DateRange />
               </div>
               {!isMulti && (
                  <div style={{ flex: '1', borderLeft: '1px solid #fff' }}>
                     <Participant experienceId={experienceId} />
                  </div>
               )}
            </div>
         </div>

         <div className="availableDate">
            {classDates.map(classDate => {
               return (
                  <AvailableDate
                     key={`${classDate?.date}-${classDate?.id}`}
                     data={classDate}
                     selectedExperienceClassId={
                        selectedSlot?.selectedExperienceClassId
                     }
                     isMulti={isMulti}
                     multiOptions={pollOptions}
                     bookingType={bookingType}
                     onClick={btnSelectionHandler}
                     cart={cart}
                  />
               )
            })}
         </div>
      </Wrapper>
   )
}
