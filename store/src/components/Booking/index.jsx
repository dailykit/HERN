import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { Wrapper } from './styles'
import { SelectClass, SelectKit, FooterButton } from './components'
import { ChevronLeft } from '../Icons'
import InlineLoader from '../InlineLoader'
import { theme } from '../../theme'
import { useCart, useExperienceInfo, useProduct } from '../../Providers'
import { isEmpty } from '../../utils'
export default function Booking({ experienceBookingId, experienceId }) {
   // const { experienceId } = useParams();
   const [experienceInfo, setExperienceInfo] = useState({})
   const [cartInfo, setCartInfo] = useState({})
   const { addProducts, addSelectedProduct, addSelectedProductOption } =
      useProduct()
   const { carts, getCart, addHostCart } = useCart()
   const {
      state: experienceState,
      previousBookingSteps,
      updateExperienceInfo
   } = useExperienceInfo()

   const router = useRouter()
   const [isCelebrating, setIsCelebrating] = useState(false)
   const stopCelebration = () => {
      setTimeout(setIsCelebrating(false), 12000)
      router.push('/myBookings')
   }
   const startCelebration = () => {
      setIsCelebrating(true)
      setTimeout(stopCelebration, 5000)
   }

   useEffect(() => {
      if (
         !isEmpty(experienceState) &&
         !isEmpty(experienceState?.experienceClasses)
      ) {
         console.log('ExperienceSTATE', experienceState)
         setExperienceInfo(experienceState)
      }
   }, [experienceState])

   // useEffect(() => {
   //   (async () => {
   //     if (!isEmpty(carts)) {
   //       const cart = await getCart(experienceId);
   //       console.log("CART", cart);
   //       if (!isEmpty(cart)) {
   //         setCartInfo(cart);
   //       }
   //     }
   //   })();
   //   // eslint-disable-next-line react-hooks/exhaustive-deps
   // }, [carts, experienceId]);

   useEffect(() => {
      if (!isEmpty(cartInfo) && !isEmpty(experienceInfo?.experienceClasses)) {
         ;(async () => {
            let alreadySelectedSlotInfo = {}
            const selectedClassTypeInfo =
               experienceInfo?.experienceClasses.find(
                  cls => cls?.id === cartInfo?.experienceClassId
               )
            experienceInfo?.classDates.forEach(classDate => {
               if (classDate.id === cartInfo?.experienceClassId) {
                  classDate?.slots.forEach(slot => {
                     if (slot.id === cartInfo?.experienceClassId) {
                        return (alreadySelectedSlotInfo = {
                           date: classDate?.date,
                           time: slot?.time,
                           selectedExperienceClassId: slot?.id
                        })
                     }
                  })
               } else {
                  classDate?.slots.forEach(slot => {
                     if (slot.id === cartInfo?.experienceClassId) {
                        return (alreadySelectedSlotInfo = {
                           date: classDate?.date,
                           time: slot?.time,
                           selectedExperienceClassId: slot?.id
                        })
                     }
                  })
               }
            })
            console.log(
               'cart info checking',
               cartInfo,
               experienceInfo,
               experienceInfo?.experienceClasses,
               selectedClassTypeInfo,
               alreadySelectedSlotInfo
            )
            await updateExperienceInfo({
               isHostParticipant: cartInfo?.isHostParticipant,
               participants: cartInfo?.totalParticipants,
               selectedSlot: alreadySelectedSlotInfo,
               priceBreakDown:
                  selectedClassTypeInfo?.classTypeInfo?.priceRanges,
               classTypeInfo: selectedClassTypeInfo?.classTypeInfo,
               kit: cartInfo?.totalKit,
               totalKitPrice: cartInfo?.totalKitPrice,
               totalPrice: cartInfo?.toPayByParent - cartInfo?.totalKitPrice
            })

            const hostCart = cartInfo?.childCarts.find(
               childCart => childCart.isHostCart
            )
            if (!isEmpty(hostCart)) {
               await addHostCart(hostCart)
            }

            const productCartItems = hostCart?.cartItems.filter(
               cartItem => cartItem.productId !== null
            )

            const productOptionId = productCartItems[0]?.productOptionId

            const productOption =
               productCartItems[0]?.product?.productOptions.find(
                  option => option.id === productOptionId
               )

            await addSelectedProduct({
               ...productCartItems[0]?.product
            })

            await addSelectedProductOption({
               ...productOption
            })
         })()
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [cartInfo])

   if (isEmpty(experienceState?.experienceClasses)) return <InlineLoader />

   return (
      // <div style={{ position: 'relative', height: '100%' }}>
      <Wrapper isCelebrating={isCelebrating}>
         <h1 className="experienceTitleHead text2">
            {experienceState?.experience?.title}
         </h1>
         {experienceInfo?.bookingStepsIndex > 0 && (
            <span
               className="previousBtn"
               onClick={() =>
                  previousBookingSteps(experienceInfo?.bookingStepsIndex)
               }
            >
               <ChevronLeft size="20" color={theme.colors.textColor5} />
            </span>
         )}

         {/* booking type form */}
         {experienceInfo?.bookingStepsIndex === 0 && (
            <SelectClass experienceId={experienceId} />
         )}

         {/* add kit form  */}
         {experienceInfo?.bookingStepsIndex === 1 && (
            <SelectKit experienceId={experienceId} />
         )}

         {/* footer  */}
         <FooterButton
            experienceId={experienceId}
            confirmNPayHandler={startCelebration}
         />
      </Wrapper>
      // </div>
   )
}
