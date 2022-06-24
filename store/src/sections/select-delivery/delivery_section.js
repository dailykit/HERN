import React from 'react'
import { rrulestr } from 'rrule'
import { isEmpty } from 'lodash'
import { useLazyQuery } from '@apollo/react-hooks'
import { useToasts } from 'react-toast-notifications'
import { useConfig } from '../../lib'

import { useDelivery } from './state'
import { formatCurrency, getRoute, isClient } from '../../utils'
import { useTranslation, useUser } from '../../context'
import { ITEM_COUNT } from '../../graphql'
import { CheckIcon, TickIcon, CrossIcon } from '../../assets/icons'
import { Loader, HelperBar } from '../../components'
import classNames from 'classnames'
import { useRouter } from 'next/router'

export const DeliverySection = ({ planId }) => {
   const { user } = useUser()
   const { addToast } = useToasts()
   const { t, dynamicTrans, locale } = useTranslation()
   const { configOf } = useConfig()
   const { state, dispatch } = useDelivery()
   const router = useRouter()
   const [fetchDays, { loading, data: { itemCount = {} } = {} }] = useLazyQuery(
      ITEM_COUNT,
      {
         onError: error => {
            console.error(error)
            addToast(t('Failed to fetch delivery days'), {
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

   const currentLang = React.useMemo(() => locale, [locale])

   React.useEffect(() => {
      const languageTags = document.querySelectorAll(
         '[data-translation="true"]'
      )
      dynamicTrans(languageTags)
   }, [currentLang])

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

   if (loading) return <Loader inline />

   //config properties
   const addressLabelFromConfig = configOf('address', 'Select-Delivery')
      ?.address?.getStarted
   const unavailableDaysFromConfig = configOf(
      'address',
      'Select-Delivery'
   )?.deliveryUnavailable

   if (isEmpty(state.address.selected))
      return (
         <>
            <HelperBar type="info">
               <HelperBar.SubTitle>
                  {addressLabelFromConfig?.value ? (
                     <span data-translation="true">
                        {addressLabelFromConfig?.value}
                     </span>
                  ) : (
                     t('Select an address to get started')
                  )}
               </HelperBar.SubTitle>
            </HelperBar>
         </>
      )
   if (isEmpty(itemCount?.valid) && isEmpty(itemCount?.invalid)) {
      return (
         <HelperBar type="warning">
            <HelperBar.SubTitle>
               {unavailableDaysFromConfig?.noDays?.value ? (
                  <span data-translation="true">
                     {unavailableDaysFromConfig?.noDays?.value}
                  </span>
               ) : (
                  t('No days are available for delivery on this address.')
               )}
            </HelperBar.SubTitle>
            <HelperBar.Button
               onClick={() => router.push(getRoute('/get-started/select-plan'))}
            >
               {t('Select Plan')}
            </HelperBar.Button>
         </HelperBar>
      )
   }
   return (
      <div className="hern-delivery__delivery-days">
         {isEmpty(itemCount?.valid) && !isEmpty(itemCount?.invalid) && (
            <HelperBar type="warning">
               <HelperBar.SubTitle>
                  {unavailableDaysFromConfig?.followingDays?.value ? (
                     <span data-translation="true">
                        {unavailableDaysFromConfig?.followingDays?.value}
                     </span>
                  ) : (
                     t(
                        'Following days are not available for delivery on this address.'
                     )
                  )}
                  {/* {unavailableDaysFromConfig?.followingDays?.value || 'Following days are not available for delivery on this address.'} */}
               </HelperBar.SubTitle>
            </HelperBar>
         )}
         <ul className="hern-delivery__delivery-days__list">
            {itemCount?.valid?.map(day => {
               const dateClasses = classNames(
                  'hern-delivery__delivery-days__list-item',
                  {
                     'hern-delivery__delivery-days__list-item--active':
                        state.delivery.selected?.id === day.id,
                  }
               )
               return (
                  <li
                     key={day.id}
                     onClick={() => daySelection(day)}
                     className={dateClasses}
                  >
                     <label
                        className="hern-delivery__delivery-days__label"
                        data-translation="true"
                     >
                        {rrulestr(day.rrule).toText()}
                     </label>
                     {day.zipcodes.length > 0 && (
                        <section className="hern-delivery__delivery-days__fulfillment">
                           <section className="hern-delivery__delivery-days__fulfillment__delivery">
                              <span>
                                 {day.zipcodes[0].isDeliveryActive ? (
                                    <TickIcon
                                       className="hern-delivery__delivery-days__tick-icon"
                                       size={16}
                                    />
                                 ) : (
                                    <CrossIcon
                                       size={16}
                                       className="hern-delivery__delivery-days__cross-icon"
                                    />
                                 )}
                              </span>
                              <p>
                                 {day.zipcodes[0].deliveryPrice === 0 ? (
                                    <span> {t('Free Delivery')}&nbsp;</span>
                                 ) : (
                                    <>
                                       <span> {t('Delivery at')} &nbsp;</span>
                                       <span>
                                          {formatCurrency(
                                             day.zipcodes[0].deliveryPrice
                                          )}
                                       </span>
                                    </>
                                 )}
                              </p>
                           </section>
                           {day.zipcodes[0].isPickupActive && (
                              <section className="hern-delivery__delivery-days__fulfillment__pickup">
                                 <span>
                                    <TickIcon
                                       className="hern-delivery__delivery-days__tick-icon"
                                       size={16}
                                    />
                                 </span>
                                 <p>{t('Pickup')}</p>
                              </section>
                           )}
                        </section>
                     )}
                  </li>
               )
            })}
            {itemCount?.invalid?.map(day => {
               return (
                  <li
                     key={day.id}
                     className="hern-delivery__delivery-days__list-item hern-delivery__delivery-days__list-item--invalid"
                     title="Not available on this zipcode"
                  >
                     <label
                        className="hern-delivery__delivery-days__label"
                        data-translation="true"
                     >
                        {rrulestr(day.rrule).toText()}
                     </label>
                     {day.zipcodes.length > 0 && (
                        <section className="hern-delivery__delivery-days__fulfillment">
                           <section className="hern-delivery__delivery-days__fulfillment__delivery">
                              <span>
                                 {day.zipcodes[0].isDeliveryActive ? (
                                    <TickIcon
                                       className="hern-delivery__delivery-days__tick-icon"
                                       size={16}
                                    />
                                 ) : (
                                    <CrossIcon
                                       size={16}
                                       className="hern-delivery__delivery-days__cross-icon"
                                    />
                                 )}
                              </span>
                              <p>
                                 {day.zipcodes[0].deliveryPrice === 0 ? (
                                    <span> {t('Free Delivery')}</span>
                                 ) : (
                                    <>
                                       <span> {t('Delivery at')}</span>
                                       <span>
                                          {formatCurrency(
                                             day.zipcodes[0].deliveryPrice
                                          )}
                                       </span>
                                    </>
                                 )}
                              </p>
                           </section>
                           <section className="hern-delivery__delivery-days__fulfillment__pickup">
                              <span>
                                 {day.zipcodes[0].isPickupActive ? (
                                    <TickIcon
                                       className="hern-delivery__delivery-days__tick-icon"
                                       size={16}
                                    />
                                 ) : (
                                    <CrossIcon
                                       size={16}
                                       className="hern-delivery__delivery-days__cross-icon"
                                    />
                                 )}
                              </span>
                              <p>{t('Pickup')}</p>
                           </section>
                        </section>
                     )}
                  </li>
               )
            })}
         </ul>
      </div>
   )
}
