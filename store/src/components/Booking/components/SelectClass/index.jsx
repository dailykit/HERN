import React, { useEffect, useRef, useMemo } from 'react'
import { Wrapper, Popup } from './styles'
import { message } from 'antd'
import Participant from '../Participant'
import PriceBreakDown from '../PriceBreakDown'
import AvailableDate from '../../../AvailableDate'
import {
   useExperienceInfo,
   useCart,
   useUser,
   usePoll
} from '../../../../Providers'
import { isEmpty } from '../../../../utils'

export default function SelectClass({ experienceId, isMulti = false }) {
   const node = useRef()
   const { state: userState, toggleAuthenticationModal } = useUser()
   const { isAuthenticated } = userState
   const {
      state,
      updateExperienceInfo,
      toggleDetailBreakdown,
      nextBookingSteps
   } = useExperienceInfo()
   const { getCart } = useCart()
   const cart = getCart(experienceId)
   const {
      experience,
      bookingType,
      bookingStepsIndex,
      participants,
      classDates,
      selectedSlot,
      pricePerPerson,
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

   const showLoginModal = () => {
      message.warning('Please login to continue')
      toggleAuthenticationModal(true)
   }

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
            if (
               !isEmpty(experience) &&
               experience?.experience_products_aggregate?.aggregate?.count > 0
            ) {
               nextBookingSteps(bookingStepsIndex)
            }
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
         <div className="flex_row">
            <h2 className="heading text3">
               ${pricePerPerson.toFixed(2)} Per Person
            </h2>
            <div style={{ position: 'relative' }}>
               <button
                  className="breakdown-head text8"
                  onClick={() => toggleDetailBreakdown(prev => !prev)}
               >
                  Breakdown
               </button>
               <Popup show={priceBreakDownDrawer}>
                  <div className="pointer" />
                  <PriceBreakDown />
               </Popup>
            </div>
         </div>
         <div className="sticky-container">
            <div className="select-option" ref={node}>
               {!isMulti && (
                  <>
                     {/* <div style={{ flex: '1' }}>
                  <DateRange />
               </div> */}
                     {/* <div style={{ flex: '1', borderLeft: '1px solid #fff' }}> */}
                     <Participant experienceId={experienceId} />
                     {/* </div> */}
                  </>
               )}
            </div>
         </div>

         <div className="availableDate">
            <h1 className="availableDate_head text8">
               SELECT AN AVAILABLE TIME SLOT
            </h1>
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
                     onClick={data =>
                        isAuthenticated
                           ? btnSelectionHandler(data)
                           : showLoginModal()
                     }
                     cart={cart}
                  />
               )
            })}
         </div>
      </Wrapper>
   )
}
