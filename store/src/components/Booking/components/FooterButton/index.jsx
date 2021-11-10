import React from 'react'
import { FooterBtnWrap } from './styles'
import { useKitSelection } from '../../handleKitSelection'
import Button from '../../../Button'
import CustomTooltip from '../../../CustomTooltip'
import { useCustomMutation } from '../../useCustomMutation'
import { useCheckoutHandler } from '../../checkoutHandler'
import { useExperienceInfo, useProduct } from '../../../../Providers'
import { isEmpty } from '../../../../utils'

export default function FooterButton({
   experienceId,
   confirmNPayHandler,
   sendPollHandler
}) {
   const { CART, CHILD_CART } = useCustomMutation()
   const { initiateCheckout } = useCheckoutHandler()
   const { state: productState } = useProduct()
   const { handleKitSelection } = useKitSelection()
   const { selectedProductOption = {} } = productState
   const { state: experienceState } = useExperienceInfo()
   const { bookingStepsIndex, experience } = experienceState
   const handleNextButtonClick = async () => {
      initiateCheckout()
   }

   const isCheckoutDisabled = () => {
      const { footerDisable } = handleKitSelection({
         kitCount: experience?.experience_products_aggregate?.aggregate?.count,
         isKitMandatory: experience?.isKitMandatory,
         isKitAdded: !isEmpty(selectedProductOption)
      })
      if (footerDisable || CART.create.loading || CHILD_CART.create.loading)
         return true
      return false
   }

   return (
      <FooterBtnWrap>
         {bookingStepsIndex === 0 && (
            <div className="flex-row-wrap">
               <Button
                  className="ghost-btn text8 box-shadow-glow"
                  onClick={sendPollHandler}
               >
                  Poll your guests before you book
               </Button>
               <CustomTooltip title="Not sure which date works best for all of your guests? Create a poll with several dates/times and allow them to vote. You’ll be able to manage your polls on your dashboard page." />
            </div>
         )}
         {bookingStepsIndex === 1 && (
            <Button
               disabled={isCheckoutDisabled()}
               className="nextBtn text3"
               onClick={handleNextButtonClick}
            >
               Checkout
            </Button>
         )}
      </FooterBtnWrap>
   )
}
