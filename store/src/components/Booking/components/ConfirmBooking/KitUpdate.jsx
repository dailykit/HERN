import React from 'react'
import { Flex } from '@dailykit/ui'
import { useCustomMutation } from '../../useCustomMutation'
import Button from '../../../Button'
import { ChevronRight, AddIcon, MinusIcon } from '../../../Icons'
import {
   useUser,
   useExperienceInfo,
   useProduct,
   useCart
} from '../../../../Providers'
import { isEmpty, capitalize } from '../../../../utils'
import { theme } from '../../../../theme'

export default function KitUpdate({ experienceId }) {
   const { CART_ITEM } = useCustomMutation()
   const { getCart } = useCart()
   const cart = getCart(experienceId)
   const { state: productState } = useProduct()
   const { selectedProductOption } = productState
   const { state: userState, toggleAddressModal } = useUser()
   const {
      user: { defaultCustomerAddress }
   } = userState
   const { state: experienceState, updateExperienceInfo } = useExperienceInfo()
   const { kit, classTypeInfo, totalKitPrice } = experienceState

   const handleKitCouter = async type => {
      const hostChildCart = cart?.childCarts.find(
         childCart => childCart.customerKeycloakId !== null
      )

      const productCartItems = hostChildCart?.cartItems.filter(
         cartItem => cartItem.productId !== null
      )
      if (type === 'inc') {
         if (kit >= classTypeInfo?.maximumParticipant) return
         await updateExperienceInfo({
            kit: kit + 1
         })
         if (!isEmpty(cart)) {
            console.log('NOt empty', cart)
            await CART_ITEM.create.mutation({
               variables: {
                  object: {
                     ...selectedProductOption?.cartItem,
                     cartId: !isEmpty(hostChildCart) ? hostChildCart?.id : null
                  }
               }
            })
         }
      } else {
         if (kit <= 0) return
         if (isEmpty(productCartItems)) return
         await updateExperienceInfo({
            kit: kit - 1
         })
         await CART_ITEM.delete.mutation({
            variables: {
               id: productCartItems[0]?.id
            }
         })
      }
   }

   return (
      <div className="counter-update">
         <Flex container alignItems="center" justifyContent="space-between">
            <Flex
               container
               flexDirection="column"
               justifyContent="space-between"
               flex="1"
               padding="1rem"
            >
               <p>Kits for you</p>
               <small>
                  <em>${(totalKitPrice / kit).toFixed(1)} per kit</em>
               </small>
            </Flex>
            <Flex
               container
               alignItems="center"
               justifyContent="space-evenly"
               flex="1"
            >
               <Button
                  className="customCounterBtn"
                  customWidth="30px"
                  customHeight="30px"
                  onClick={() => handleKitCouter('dec')}
                  btnType="circle"
               >
                  <MinusIcon
                     size={theme.sizes.h9}
                     color={theme.colors.textColor4}
                  />
               </Button>
               <p className="guest-count">{kit}</p>
               <Button
                  className="customCounterBtn"
                  customWidth="30px"
                  customHeight="30px"
                  onClick={() => handleKitCouter('inc')}
                  btnType="circle"
               >
                  <AddIcon
                     size={theme.sizes.h9}
                     color={theme.colors.textColor4}
                  />
               </Button>
            </Flex>
         </Flex>
         {kit > 0 && (
            <div style={{ marginTop: '1rem' }}>
               {!isEmpty(defaultCustomerAddress) ? (
                  <div className="update-address">
                     <Flex
                        container
                        align="center"
                        justifyContent="space-between"
                     >
                        <p>Your kits will be delivered</p>
                        <Flex container alignItems="center">
                           <p
                              onClick={() => toggleAddressModal(true)}
                              className="change-head"
                           >
                              Change Address
                           </p>
                           <ChevronRight
                              size={theme.sizes.h6}
                              color={theme.colors.textColor}
                           />
                        </Flex>
                     </Flex>
                     <div className="address-div">
                        <small>Default</small>
                        <p>{capitalize(defaultCustomerAddress?.label || '')}</p>
                        <p>{`${defaultCustomerAddress?.line1},${defaultCustomerAddress?.line2},${defaultCustomerAddress?.city},${defaultCustomerAddress?.state}-${defaultCustomerAddress?.zipcode}`}</p>
                     </div>
                  </div>
               ) : (
                  <div
                     className="coupon-wrapper"
                     onClick={() => toggleAddressModal(true)}
                  >
                     <Flex
                        container
                        alignItems="center"
                        justifyContent="center"
                     >
                        + ADD ADDRESS
                     </Flex>
                  </div>
               )}
            </div>
         )}
      </div>
   )
}
