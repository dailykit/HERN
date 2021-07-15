import React from 'react'
import { rrulestr } from 'rrule'
import { isEmpty } from 'lodash'
import tw, { styled, css } from 'twin.macro'
import { useLazyQuery } from '@apollo/react-hooks'
import { useToasts } from 'react-toast-notifications'

import { useDelivery } from './state'
import { formatCurrency, getRoute, isClient } from '../../utils'
import { useUser } from '../../context'
import { ITEM_COUNT } from '../../graphql'
import { CheckIcon, TickIcon, CrossIcon } from '../../assets/icons'
import { Loader, HelperBar } from '../../components'

export const DeliverySection = ({ planId }) => {
   const { user } = useUser()
   const { addToast } = useToasts()
   const { state, dispatch } = useDelivery()
   const [fetchDays, { loading, data: { itemCount = {} } = {} }] = useLazyQuery(
      ITEM_COUNT,
      {
         onError: error => {
            addToast('Failed to fetch delivery days', {
               appearance: 'error',
            })
         },
         fetchPolicy: 'cache-and-network',
      }
   )

   React.useEffect(() => {
      if (user.subscriptionId && !planId) {
         dispatch({
            type: 'SET_DAY',
            payload: {
               id: user.subscriptionId,
            },
         })
      }
   }, [user.subscriptionId, dispatch])

   React.useEffect(() => {
      if (!isEmpty(state.address.selected)) {
         fetchDays({
            variables: {
               isDemo: user?.isDemo,
               zipcode: state.address.selected.zipcode,
               id: planId ?? (isClient && window.localStorage.getItem('plan')),
            },
         })
      }
   }, [state.address.selected, fetchDays, planId])

   const daySelection = day => {
      dispatch({ type: 'SET_DAY', payload: day })
   }

   if (loading)
      return (
         <>
            <Loader inline />
         </>
      )
   if (isEmpty(state.address.selected))
      return (
         <>
            <HelperBar type="info">
               <HelperBar.SubTitle>
                  Select an address to get started
               </HelperBar.SubTitle>
            </HelperBar>
         </>
      )
   if (isEmpty(itemCount?.valid) && isEmpty(itemCount?.invalid)) {
      return (
         <HelperBar type="warning">
            <HelperBar.SubTitle>
               No days are available for delivery on this address.
            </HelperBar.SubTitle>
            <HelperBar.Button
               onClick={() => router.push(getRoute('/get-started/select-plan'))}
            >
               Select Plan
            </HelperBar.Button>
         </HelperBar>
      )
   }
   return (
      <>
         {isEmpty(itemCount?.valid) && !isEmpty(itemCount?.invalid) && (
            <HelperBar type="warning">
               <HelperBar.SubTitle>
                  Following days are not available for delivery on this address.
               </HelperBar.SubTitle>
            </HelperBar>
         )}
         <DeliveryDays>
            {itemCount?.valid?.map(day => (
               <DeliveryDay
                  key={day.id}
                  onClick={() => daySelection(day)}
                  className={`${
                     state.delivery.selected?.id === day.id && 'active'
                  }`}
               >
                  <DeliveryDayLeft>
                     <CheckIcon
                        size={18}
                        css={[
                           tw`stroke-current`,
                           state.delivery.selected?.id === day.id
                              ? tw`text-green-700`
                              : tw`text-gray-400`,
                        ]}
                     />
                  </DeliveryDayLeft>
                  <section css={tw`py-2 flex flex-col space-y-2`}>
                     <label css={tw`w-full cursor-pointer`}>
                        {rrulestr(day.rrule).toText()}
                     </label>
                     {day.zipcodes.length > 0 && (
                        <section css={tw`flex space-x-2 items-center`}>
                           <Fulfillment>
                              <span>
                                 {day.zipcodes[0].isDeliveryActive ? (
                                    <TickIcon
                                       size={16}
                                       tw="stroke-current text-green-600"
                                    />
                                 ) : (
                                    <CrossIcon
                                       size={16}
                                       tw="stroke-current text-red-600"
                                    />
                                 )}
                              </span>
                              <p>
                                 {day.zipcodes[0].deliveryPrice === 0
                                    ? 'Free Delivery'
                                    : `Delivery at ${formatCurrency(
                                         day.zipcodes[0].deliveryPrice
                                      )}`}
                              </p>
                           </Fulfillment>
                           {day.zipcodes[0].isPickupActive && (
                              <Fulfillment>
                                 <span>
                                    <TickIcon
                                       size={16}
                                       tw="stroke-current text-green-600"
                                    />
                                 </span>
                                 <p>Pickup</p>
                              </Fulfillment>
                           )}
                        </section>
                     )}
                  </section>
               </DeliveryDay>
            ))}
            {itemCount?.invalid?.map(day => (
               <DeliveryDay
                  key={day.id}
                  className="invalid"
                  title="Not available on this zipcode"
               >
                  <DeliveryDayLeft>
                     <CheckIcon size={18} tw="stroke-current text-gray-400" />
                  </DeliveryDayLeft>
                  <section css={tw`py-2 flex flex-col space-y-2`}>
                     <label css={tw`w-full cursor-pointer`}>
                        {rrulestr(day.rrule).toText()}
                     </label>
                     {day.zipcodes.length > 0 && (
                        <section css={tw`flex space-x-2 items-center`}>
                           <Fulfillment>
                              <span>
                                 {day.zipcodes[0].isDeliveryActive ? (
                                    <TickIcon
                                       size={16}
                                       tw="stroke-current text-green-600"
                                    />
                                 ) : (
                                    <CrossIcon
                                       size={16}
                                       tw="stroke-current text-red-600"
                                    />
                                 )}
                              </span>
                              <p>
                                 {day.zipcodes[0].deliveryPrice === 0
                                    ? 'Free Delivery'
                                    : `Delivery at ${formatCurrency(
                                         day.zipcodes[0].deliveryPrice
                                      )}`}
                              </p>
                           </Fulfillment>
                           <Fulfillment>
                              <span>
                                 {day.zipcodes[0].isPickupActive ? (
                                    <TickIcon
                                       size={16}
                                       tw="stroke-current text-green-600"
                                    />
                                 ) : (
                                    <CrossIcon
                                       size={16}
                                       tw="stroke-current text-red-600"
                                    />
                                 )}
                              </span>
                              <p>Pickup</p>
                           </Fulfillment>
                        </section>
                     )}
                  </section>
               </DeliveryDay>
            ))}
         </DeliveryDays>
      </>
   )
}

const DeliveryDays = styled.ul`
   ${tw`
      grid 
      gap-2
      sm:grid-cols-2 
      md:grid-cols-3 
   `}
`

const Fulfillment = styled.section`
   ${tw`flex items-center space-x-1`}
   span {
      ${tw`h-5 w-5 flex items-center justify-center`}
   }
   p {
      ${tw`text-gray-500`}
   }
`

const DeliveryDayLeft = styled.aside(
   () => css`
      width: 48px;
      height: 48px;
      ${tw`h-full mr-2 flex flex-shrink-0 items-center justify-center`}
   `
)

const DeliveryDay = styled.li`
   height: auto;
   min-height: 48px;
   ${tw`cursor-pointer flex items-center border capitalize text-gray-700 rounded overflow-hidden border-gray-300 hover:(border-2 border-green-700)`}
   &.invalid {
      opacity: 0.6;
      cursor: not-allowed;
      position: relative;
      :after {
         top: 0;
         left: 0;
         content: '';
         width: 100%;
         height: 100%;
         position: absolute;
      }
   }
   :hover svg {
      ${tw`text-green-700`}
   }
   &.active {
      ${tw`border-2 border-green-700`}
   }
`
