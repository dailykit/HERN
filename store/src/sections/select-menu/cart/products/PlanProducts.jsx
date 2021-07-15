import React from 'react'
import tw, { css, styled } from 'twin.macro'
import { useMutation } from '@apollo/react-hooks'
import { useToasts } from 'react-toast-notifications'
import Countdown from 'react-countdown'

import { useMenu } from '../../state'
import { CartProducts } from '../styled'
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
         <header tw="mt-3 mb-2 pb-1 border-b flex items-center justify-between">
            <h4 tw="text-lg text-gray-700">
               Your Box{' '}
               {state?.occurenceCustomer?.validStatus?.addedProductsCount}/
               {user?.subscription?.recipes?.count}
            </h4>

            <section tw="sm:hidden md:block">
               {state.cartState === 'SAVING' && (
                  <span tw="text-sm bg-blue-200 text-blue-700  rounded-full px-3 font-medium">
                     SAVING
                  </span>
               )}
               {state.cartState === 'SAVED' && (
                  <span tw="text-sm bg-green-200 text-green-700 rounded-full px-3 font-medium">
                     SAVED
                  </span>
               )}
            </section>
            {isSkippable && !state.occurenceCustomer?.betweenPause && (
               <SkipWeek>
                  <label htmlFor="skip" tw="mr-2 text-gray-600">
                     Skip
                  </label>
                  <input
                     name="skip"
                     type="checkbox"
                     className="toggle"
                     onChange={skipWeek}
                     checked={state?.occurenceCustomer?.isSkipped}
                     tw="cursor-pointer appearance-none"
                  />
               </SkipWeek>
            )}
         </header>
         {!isCheckout && state.week.cutoffTimeStamp && (
            <section
               tw="block mb-3"
               title={formatDate(state.week.cutoffTimeStamp)}
            >
               Time remaining:{' '}
               <Countdown
                  onComplete={onWeekEnd}
                  date={state.week.cutoffTimeStamp}
               />
            </section>
         )}
         <CartProducts>
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
         </CartProducts>
      </div>
   )
}

export default PlanProducts

const SkipWeek = styled.span(
   () => css`
      ${tw`flex items-center`}

      .toggle {
         height: 18px;
         transition: all 0.2s ease;
         ${tw`relative w-8 inline-block rounded-full border border-gray-400`}
      }
      .toggle:after {
         content: '';
         top: 1px;
         left: 1px;
         width: 14px;
         height: 14px;
         transition: all 0.2s cubic-bezier(0.5, 0.1, 0.75, 1.35);
         ${tw`absolute bg-green-500 rounded-full`}
      }
      .toggle:checked {
         ${tw`border-green-500 bg-green-500`}
      }
      .toggle:checked:after {
         transform: translatex(14px);
         ${tw`bg-white`}
      }
   `
)
