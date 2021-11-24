import React, { useMemo } from 'react'
import { Wrapper } from './styles'
import { message, Popover } from 'antd'
import { useCheckoutHandler } from '../../checkoutHandler'
import { useKitSelection } from '../../handleKitSelection'
import Participant from '../Participant'
import PriceBreakDown from '../PriceBreakDown'
import AvailableDate from '../../../AvailableDate'
import CustomScrollbar from '../../../CustomScrollbar'
import { HelpCircle } from '../../../Icons'
import CustomTooltip from '../../../CustomTooltip'
import {
   useExperienceInfo,
   useCart,
   useUser,
   usePoll,
   useProduct
} from '../../../../Providers'
import { isEmpty } from '../../../../utils'
import { theme } from '../../../../theme'

export default function SelectClass({ experienceId, isMulti = false }) {
   const { state: userState, toggleAuthenticationModal } = useUser()
   const { initiateCheckout } = useCheckoutHandler()
   const { handleKitSelection } = useKitSelection()
   const { state: productState, removeSelectedProduct } = useProduct()
   const { selectedProductOption } = productState
   const { isAuthenticated } = userState
   const { state, updateExperienceInfo, nextBookingSteps } = useExperienceInfo()
   const { getCart } = useCart()
   const cart = getCart(experienceId)
   const {
      experience,
      bookingType,
      bookingStepsIndex,
      classDates,
      selectedSlot,
      pricePerPerson,
      experienceClasses
   } = useMemo(() => {
      return state
   }, [state])

   const {
      state: pollState,
      addToPollOptions,
      removeFromPollOptions
   } = usePoll()
   const { pollOptions } = pollState

   const showLoginModal = () => {
      message.warning('Please login to continue')
      toggleAuthenticationModal(true)
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
            const { goToKitSelection } = handleKitSelection({
               kitCount:
                  experience?.experience_products_aggregate?.aggregate?.count,
               isKitMandatory: experience?.isKitMandatory,
               isKitAdded: !isEmpty(selectedProductOption)
            })
            if (goToKitSelection) {
               await removeSelectedProduct()
               nextBookingSteps(bookingStepsIndex)
            } else {
               initiateCheckout()
            }
         }
      }
   }

   return (
      <Wrapper>
         <div className="first_section_wrapper">
            <div className="flex_row">
               <h2 className="heading text4_secondary">
                  Starting at ${pricePerPerson.toFixed(2)} Per Person
               </h2>
               {/* <Popover
                  placement="bottom"
                  trigger="click"
                  content={<PriceBreakDown />}
               >
                  <span>
                     <HelpCircle size={24} color={theme.colors.textColor7} />
                  </span>
               </Popover> */}
               <CustomTooltip title={<PriceBreakDown />} />
            </div>
            {!isMulti && (
               <div className="sticky-container">
                  <div className="select-option">
                     <Participant experienceId={experienceId} />
                  </div>
               </div>
            )}
            <h1 className="availableDate_head text8">
               SELECT AN AVAILABLE TIME SLOT
            </h1>
         </div>
         <div className="availableDate">
            {/* <CustomScrollbar> */}

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
            {/* </CustomScrollbar> */}
         </div>
      </Wrapper>
   )
}
