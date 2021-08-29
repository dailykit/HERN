import React from 'react'
import { useMutation } from '@apollo/react-hooks'
import { useToasts } from 'react-toast-notifications'
import Countdown from 'react-countdown'

import { useMenu } from '../../state'
import { useUser } from '../../../../context'
import { formatDate } from '../../../../utils'
import { MUTATIONS } from '../../../../graphql'
import { ProductSkeleton, CartProduct } from '../../../../components'

const PlanProducts = ({ noSkip, isCheckout }) => {
   const { user } = useUser()
   const { addToast } = useToasts()
   const { state, methods, dispatch } = useMenu()

   const [upsertOccurenceCustomer] = useMutation(
      MUTATIONS.OCCURENCE.CUSTOMER.UPSERT,
      {
         onCompleted: ({ upsertOccurenceCustomerCart = {} }) => {
            if (upsertOccurenceCustomerCart.isSkipped) {
               return addToast('Skipped this week', { appearance: 'warning' })
            }
            addToast('This week is now available for menu selection', {
               appearance: 'success',
            })
         },
         onError: error => {
            addToast(error.message, {
               appearance: 'error',
            })
         },
      }
   )

   const skipWeek = () => {
      upsertOccurenceCustomer({
         variables: {
            object: {
               keycloakId: user.keycloakId,
               brand_customerId: user.brandCustomerId,
               subscriptionOccurenceId: state.week.id,
               isSkipped: Boolean(!state.occurenceCustomer?.isSkipped),
            },
         },
      })
   }

   const isSkippable =
      ['CART_PENDING', undefined].includes(
         state?.occurenceCustomer?.cart?.status
      ) &&
      state?.week?.isValid &&
      !noSkip

   const isRemovable =
      ['CART_PENDING', undefined].includes(
         state?.occurenceCustomer?.cart?.status
      ) && state?.week?.isValid

   const onWeekEnd = data => {
      if (data?.completed) {
         const { week = {} } = state
         const weekIndex = state.occurences.findIndex(
            node => node.id === week?.id
         )
         const nextWeekExists = weekIndex < state.occurences.length - 1
         if (weekIndex !== -1 && nextWeekExists) {
            dispatch({
               type: 'SET_WEEK',
               payload: state.occurences[weekIndex + 1],
            })
         }
      }
   }

   return (
      <div>
         <header className="hern-cart-plan-products__header">
            <h4 className="hern-cart-plan-products__header__title">
               Your Box{' '}
               {state?.occurenceCustomer?.validStatus?.addedProductsCount}/
               {user?.subscription?.recipes?.count}
            </h4>

            <section className="hern-cart-plan-products__saving-status">
               {state.cartState === 'SAVING' && (
                  <span className="hern-cart-plan-products__saving-status__saving">
                     SAVING
                  </span>
               )}
               {state.cartState === 'SAVED' && (
                  <span className="hern-cart-plan-products__saving-status__saved">
                     SAVED
                  </span>
               )}
            </section>
            {isSkippable && !state.occurenceCustomer?.betweenPause && (
               <span className="hern-cart-plan-products__skip-week">
                  <label
                     className="hern-cart-plan-products__skip-week__label"
                     htmlFor="skip"
                  >
                     Skip
                  </label>
                  <input
                     name="skip"
                     type="checkbox"
                     className="hern-cart-plan-products__skip-week__toggle"
                     onChange={skipWeek}
                     checked={state?.occurenceCustomer?.isSkipped}
                  />
               </span>
            )}
         </header>
         {!isCheckout && state.week.cutoffTimeStamp && (
            <section
               className="hern-cart-plan-products__count-down"
               title={formatDate(state.week.cutoffTimeStamp)}
            >
               Time remaining:{' '}
               <Countdown
                  onComplete={onWeekEnd}
                  date={state.week.cutoffTimeStamp}
               />
            </section>
         )}
         <ul className="hern-cart-plan-products__list">
            {state?.occurenceCustomer?.cart?.products?.map(
               product =>
                  !product.isAddOn && (
                     <CartProduct
                        product={product}
                        key={product.id}
                        isRemovable={isRemovable}
                        onDelete={methods.products.delete}
                     />
                  )
            )}
            {Array.from(
               {
                  length:
                     state?.occurenceCustomer?.validStatus
                        ?.pendingProductsCount,
               },
               (_, index) => (
                  <ProductSkeleton key={index} />
               )
            )}
         </ul>
      </div>
   )
}

export default PlanProducts
