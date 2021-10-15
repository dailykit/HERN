import React, { useState, useEffect } from 'react'
import { Wrapper } from './styles'
import { useCustomMutation } from '../../../customMutations/useBookingInviteResponseCustomMutation'
import { Button, Spacer } from '../../../components'
import { useUser, useRsvp } from '../../../Providers'
import { isEmpty } from '../../../utils'

export default function SubmitResponse({ startCelebration }) {
   const { CART, PARTICIPANT, CART_ITEM } = useCustomMutation()
   const { state: userState } = useUser()
   const { state: rsvpState, nextRsvpStep } = useRsvp()
   const [isDisabled, setIsDisabled] = useState(true)
   const { user = {} } = userState
   const {
      rsvpStepIndex,
      responseDetails,
      selectedProductOption,
      isPollClosed,
      participantId,
      decodedToken,
      experienceBooking,
      experienceBookingParticipant,
      cartItems
   } = rsvpState

   const submitResponseHandler = async () => {
      if (!isDisabled && !isPollClosed) {
         if (rsvpStepIndex === 1) {
            if (participantId) {
               // this mutation is used to update the cart whether the link is a public url
               // or invite link through email/phone(private url)
               // if token has cartId it means it is a private url
               // if using cartId from experienceBookingParticipant it means it is a public url
               await CART.update.mutation({
                  variables: {
                     cartId:
                        decodedToken?.cartId ||
                        experienceBookingParticipant?.cartId,
                     _set: {
                        customerKeycloakId: user?.keycloakId || null,
                        address: responseDetails?.address,
                        experienceClassId:
                           experienceBooking?.parentCart?.experienceClassId,
                        experienceClassTypeId:
                           experienceBooking?.parentCart?.experienceClassTypeId
                     }
                  }
               })

               const cartItemObjectForExperience = {
                  cartId:
                     decodedToken?.cartId ||
                     experienceBookingParticipant?.cartId,
                  experienceClassId:
                     experienceBooking?.parentCart?.experienceClassId,
                  experienceClassTypeId:
                     experienceBooking?.parentCart?.experienceClassTypeId
               }
               const cartItemObjectForKit = {
                  ...experienceBooking?.experienceClass?.experience
                     ?.experience_products[0]?.product?.productOptions[0]
                     ?.cartItem,
                  experienceClassId:
                     experienceBooking?.parentCart?.experienceClassId,
                  experienceClassTypeId:
                     experienceBooking?.parentCart?.experienceClassTypeId,
                  cartId:
                     decodedToken?.cartId ||
                     experienceBookingParticipant?.cartId
               }

               console.log({
                  cartItemObjectForKit,
                  cartItemObjectForExperience
               })

               if (!Boolean(decodedToken?.cartId)) {
                  await CART_ITEM.createMany.mutation({
                     variables: {
                        objects: [
                           cartItemObjectForExperience,
                           cartItemObjectForKit
                        ]
                     }
                  })
               }

               await PARTICIPANT.update.mutation({
                  variables: {
                     id: participantId,
                     _set: {
                        experienceBookingId: decodedToken?.experienceBookingId,
                        email: responseDetails?.email?.value,
                        phone: responseDetails?.phone?.value,
                        keycloakId: user?.keycloakId ? user?.keycloakId : null,
                        rsvp: true
                     }
                  }
               })
               localStorage.removeItem('bookingInviteUrl')
               startCelebration()
            }
         } else {
            nextRsvpStep(rsvpStepIndex)
         }
      }
   }

   useEffect(() => {
      if (rsvpStepIndex === 0) {
         if (
            isPollClosed ||
            !responseDetails?.email?.value ||
            !responseDetails?.phone?.value ||
            responseDetails?.email?.error ||
            responseDetails?.phone?.error
         ) {
            setIsDisabled(true)
         } else {
            setIsDisabled(false)
         }
      } else {
         if (
            isPollClosed ||
            PARTICIPANT.update.loading ||
            CART.create.loading ||
            (decodedToken?.parentShare === 100
               ? false
               : isEmpty(selectedProductOption)) ||
            responseDetails?.address === null
         ) {
            setIsDisabled(true)
         } else {
            setIsDisabled(false)
         }
      }
   }, [
      rsvpStepIndex,
      isPollClosed,
      PARTICIPANT.update.loading,
      CART.create.loading,
      responseDetails.email,
      responseDetails.phone,
      responseDetails.address,
      selectedProductOption,
      decodedToken.parentShare
   ])

   return (
      <>
         <Wrapper>
            <p className="Proxima-Nova text9 poll-expiry-msg">
               {rsvpStepIndex === 0
                  ? `😇 ${
                       decodedToken?.invitedBy?.name ||
                       decodedToken?.invitedBy?.email
                    } has already paid for your experience and kit.`
                  : '😇 Your Invitation includes Kit delivery.'}
            </p>
            <Button
               onClick={submitResponseHandler}
               disabled={isDisabled}
               className="custom-submit-btn text3"
            >
               {rsvpStepIndex === 0 ? 'Next' : ' Accept Invitation'}
            </Button>
         </Wrapper>
      </>
   )
}
