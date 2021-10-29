import { useRouter } from 'next/router'
import { useCustomMutation } from './useCustomMutation'
import { isEmpty, omitDate } from '../../utils'
import {
   useExperienceInfo,
   useCart,
   useUser,
   useProduct
} from '../../Providers'
import { useConfig } from '../../lib'

export const useCheckoutHandler = () => {
   const router = useRouter()
   const {
      CART,
      CHILD_CART,
      CART_ITEM,
      EXPERIENCE_BOOKING,
      EXPERIENCE_PARTICIPANTS
   } = useCustomMutation()
   const { brand } = useConfig()
   const { state: userState } = useUser()
   const { state: productState } = useProduct()
   const { cartItems = [] } = productState
   const {
      user: { defaultCustomerAddress, keycloakId, paymentCustomerId }
   } = userState
   const { state: experienceState } = useExperienceInfo()
   const {
      participants,
      isHostParticipant,
      selectedSlot,
      classTypeInfo,
      experienceBookingDetails,
      experience
   } = experienceState
   const { getCart } = useCart()
   const cart = getCart(experience?.id)

   const initiateCheckout = async () => {
      if (isEmpty(cart)) {
         const childCartArray = []

         for (let i = 0; i < participants; i++) {
            childCartArray.push({
               rsvp: false,
               childCart: {
                  data: {
                     customerKeycloakId:
                        i === 0 && isHostParticipant ? keycloakId : null,
                     address: i === 0 ? defaultCustomerAddress : null,
                     paymentCustomerId: i === 0 ? paymentCustomerId : null,
                     experienceClassId: selectedSlot?.selectedExperienceClassId,
                     experienceClassTypeId: classTypeInfo?.id,

                     cartItems: {
                        data: [
                           ...cartItems,
                           {
                              experienceClassId:
                                 selectedSlot?.selectedExperienceClassId ||
                                 null,
                              experienceClassTypeId: classTypeInfo?.id
                              //   taxSetting: {
                              //      taxPercentage: 10,
                              //      isTaxIncluded: true,
                              //      isTaxable: true
                              //   }
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
                              paymentCustomerId,
                              experienceClassId:
                                 selectedSlot?.selectedExperienceClassId,
                              experienceClassTypeId: classTypeInfo?.id,
                              brandId: brand?.id
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
                                 createExperienceBooking?.parentCart?.id,
                              brandId: brand?.id
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
   }

   return {
      initiateCheckout
   }
}
