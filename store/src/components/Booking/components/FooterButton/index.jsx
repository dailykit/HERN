import React from 'react'
import { Flex } from '@dailykit/ui'
import { useRouter } from 'next/router'
import { FooterBtnWrap } from './styles'
import Button from '../../../Button'
import { useCustomMutation } from '../../useCustomMutation'
import {
   useUser,
   useExperienceInfo,
   useCart,
   useProduct
} from '../../../../Providers'
import { isEmpty, omitDate } from '../../../../utils'

export default function FooterButton({ experienceId, confirmNPayHandler }) {
   const router = useRouter()
   const {
      CART,
      CHILD_CART,
      CART_ITEM,
      EXPERIENCE_BOOKING,
      EXPERIENCE_PARTICIPANTS
   } = useCustomMutation()
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
   const { getCart } = useCart()
   const cart = getCart(experienceId)
   const {
      state: experienceState,
      nextBookingSteps,
      updateExperienceInfo
   } = useExperienceInfo()
   const {
      totalPrice,
      kit,
      totalKitPrice,
      bookingStepsIndex,
      participants,
      isHostParticipant,
      selectedSlot,
      classTypeInfo,
      experienceBookingDetails
   } = experienceState
   const handleNextButtonClick = async () => {
      if (bookingStepsIndex === 1) {
         if (isEmpty(cart)) {
            const childCartArray = []
            const updatedCartItems = cartItems.map(cartItem => {
               return {
                  ...cartItem,
                  experienceClassId:
                     selectedSlot?.selectedExperienceClassId || null,
                  experienceClassTypeId: classTypeInfo?.id
               }
            })
            console.log(updatedCartItems)
            for (let i = 0; i < participants; i++) {
               childCartArray.push({
                  rsvp: false,
                  childCart: {
                     data: {
                        customerKeycloakId:
                           i === 0 && isHostParticipant ? keycloakId : null,
                        address: i === 0 ? defaultCustomerAddress : null,
                        experienceClassId:
                           selectedSlot?.selectedExperienceClassId,
                        experienceClassTypeId: classTypeInfo?.id,

                        cartItems: {
                           data: [
                              ...updatedCartItems,
                              {
                                 experienceClassId:
                                    selectedSlot?.selectedExperienceClassId ||
                                    null,
                                 experienceClassTypeId: classTypeInfo?.id
                              }
                           ]
                        }
                     }
                  }
               })
            }

            if (
               isEmpty(experienceBookingDetails) &&
               isEmpty(experienceBookingDetails?.id)
            ) {
               const { data: { createExperienceBooking = {} } = {} } =
                  await EXPERIENCE_BOOKING.create.mutation({
                     variables: {
                        object: {
                           experienceClassId:
                              selectedSlot?.selectedExperienceClassId,
                           cutoffTime: omitDate(selectedSlot?.date, 10, 'days'),
                           hostKeycloakId: keycloakId,
                           parentCart: {
                              data: {
                                 customerKeycloakId: keycloakId,
                                 experienceClassId:
                                    selectedSlot?.selectedExperienceClassId,
                                 experienceClassTypeId: classTypeInfo?.id
                              }
                           }
                        }
                     }
                  })
               await EXPERIENCE_PARTICIPANTS.create.mutation({
                  variables: {
                     objects: childCartArray.map(childCartObj => {
                        return {
                           ...childCartObj,
                           childCart: {
                              data: {
                                 ...childCartObj.childCart.data,
                                 parentCartId:
                                    createExperienceBooking?.parentCart?.id
                              }
                           },
                           experienceBookingId: createExperienceBooking?.id
                        }
                     })
                  }
               })

               router.push(
                  `/checkout?cartId=${createExperienceBooking?.parentCart?.id}`
               )
            } else {
               // this else block is only for when we are booking an experience class from a poll option
               // so in this case we have experience booking details like experienceBookingId, parentCartId
               // also the voters detail like keycloakId, email, name, etc which voted for that poll option
               // here we simply update the parent and child cart with experienceClass details also
               // we update the experienceBooking with experienceClass details
               // since experience participants and their cart is create already so we just add the kit details
               // to their cart->cartItem
               await CART.updateMany.mutation({
                  variables: {
                     cartIds: [
                        ...experienceBookingDetails?.voters.map(
                           voter => voter?.participant?.cartId
                        ),
                        experienceBookingDetails?.cartId
                     ],
                     _set: {
                        experienceClassId:
                           experienceBookingDetails?.experienceClassId,
                        experienceClassTypeId:
                           experienceBookingDetails?.experienceClassTypeId
                     }
                  }
               })
               await EXPERIENCE_BOOKING.update.mutation({
                  variables: {
                     id: experienceBookingDetails?.id,
                     _set: {
                        experienceClassId:
                           experienceBookingDetails?.experienceClassId
                     }
                  }
               })

               console.log({ experienceBookingDetails })

               const reqObjects = []
               experienceBookingDetails?.voters.forEach(voter => {
                  const cartItemObjectForExperience = {
                     cartId: voter?.participant?.cartId,
                     experienceClassId:
                        experienceBookingDetails?.experienceClassId,
                     experienceClassTypeId:
                        experienceBookingDetails?.experienceClassTypeId
                  }
                  const cartItemObjectForKit = cartItems.map(cartItem => {
                     return {
                        ...cartItem,
                        ...cartItemObjectForExperience
                     }
                  })
                  // above we made the two cartItem object for each participant cart
                  // so that we have the billing for experience and kit as well
                  // and push the two cartItem object to the reqObjects array
                  reqObjects.push(
                     cartItemObjectForExperience,
                     ...cartItemObjectForKit
                  )
               })
               console.log({ reqObjects })
               await CART_ITEM.createMany.mutation({
                  variables: {
                     objects: reqObjects
                  }
               })
               if (!CART_ITEM.createMany.loading) {
                  router.push(
                     `/checkout?cartId=${experienceBookingDetails?.cartId}`
                  )
               }
            }
         }
         if (!isEmpty(cart)) {
            const differenceInChildCart = participants - cart?.totalParticipants

            if (differenceInChildCart > 0) {
               for (let i = 0; i < Math.abs(differenceInChildCart); i++) {
                  await CHILD_CART.create.mutation({
                     variables: {
                        object: {
                           parentCartId: cart?.id,
                           experienceClassId:
                              selectedSlot?.selectedExperienceClassId || null,
                           experienceClassTypeId: classTypeInfo?.id,
                           cartItems: {
                              data: {
                                 experienceClassId:
                                    selectedSlot?.selectedExperienceClassId ||
                                    null,
                                 experienceClassTypeId: classTypeInfo?.id
                              }
                           }
                        }
                     }
                  })
               }
            } else if (differenceInChildCart < 0) {
               const childCarts = cart?.childCarts.filter(
                  childCart => childCart?.customerKeycloakId === null
               )
               const childCartIds = []
               childCarts?.forEach((childCart, index) => {
                  if (index < Math.abs(differenceInChildCart)) {
                     childCartIds.push(childCart?.id)
                  }
               })
               CART.delete.mutation({
                  variables: {
                     cartIds: childCartIds
                  }
               })
            }
         }
      } else if (bookingStepsIndex === 0) {
         nextBookingSteps(bookingStepsIndex)
      }
   }
   console.log('Footer Element', experienceState)
   return (
      <FooterBtnWrap>
         {bookingStepsIndex === 0 && (
            <>
               <button className="show-more special-underline">
                  Show More Dates
               </button>
               <button className="ghost-btn box-shadow-glow">
                  Not sure which date to choose?
               </button>
            </>
         )}
         {bookingStepsIndex === 1 && (
            <Button
               disabled={
                  isEmpty(selectedProductOption) ||
                  CART.create.loading ||
                  CHILD_CART.create.loading
               }
               className="nextBtn"
               onClick={handleNextButtonClick}
            >
               {/* <Flex container alignItems="center" justifyContent="space-between">
          <Flex flexDirection="column" container alignItems="flex-start">
            <span className="minHead">Booking amount</span>
            <Flex container alignItems="flex-start">
              <span className="minCost">
                ${(totalPrice + totalKitPrice)?.toFixed(1)}
              </span>
            </Flex>
          </Flex> */}
               {/* <div>{bookingStepsIndex === 3 ? "Confirm & Pay" : "Next"}</div> */}
               {/* </Flex> */}
               Checkout
            </Button>
         )}
      </FooterBtnWrap>
   )
}
