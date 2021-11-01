import React from 'react'
import { FooterBtnWrap } from './styles'
import Button from '../../../Button'
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
   const { selectedProductOption = {} } = productState
   const { state: experienceState } = useExperienceInfo()
   const { bookingStepsIndex, experience } = experienceState
   const handleNextButtonClick = async () => {
      initiateCheckout()
   }

   // const isCheckoutDisabled = ()=>{
   //    if((!isEmpty(experience) && experience?.isKitMandatory) && isEmpty(selectedProductOption) ||
   //    CART.create.loading ||
   //    CHILD_CART.create.loading) return true

   // }

   return (
      <FooterBtnWrap>
         {bookingStepsIndex === 0 && (
            <Button
               className="ghost-btn text6 box-shadow-glow"
               onClick={sendPollHandler}
            >
               Poll your guests before you book
            </Button>
         )}
         {bookingStepsIndex === 1 && (
            <Button
               disabled={
                  isEmpty(selectedProductOption) ||
                  CART.create.loading ||
                  CHILD_CART.create.loading
               }
               className="nextBtn text3"
               onClick={handleNextButtonClick}
            >
               Checkout
            </Button>
         )}
      </FooterBtnWrap>
   )
}
