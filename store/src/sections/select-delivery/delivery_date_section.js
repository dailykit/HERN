import React from 'react'
import { useRouter } from 'next/router'
import { isEmpty } from 'lodash'
import { useLazyQuery } from '@apollo/react-hooks'
import { useToasts } from 'react-toast-notifications'
import { useConfig } from '../../lib'

import { useDelivery } from './state'
import { CheckIcon } from '../../assets/icons'
import { Loader, HelperBar } from '../../components'
import { OCCURENCES_BY_SUBSCRIPTION } from '../../graphql'
import { formatDate, getRoute } from '../../utils'
import classNames from 'classnames'
import { useTranslation } from '../../context'

export const DeliveryDateSection = () => {
   const router = useRouter()
   const { addToast } = useToasts()
   const { t, dynamicTrans, locale } = useTranslation()
   const { state, dispatch } = useDelivery()
   const [occurences, setOccurences] = React.useState([])
   const [fetchOccurences, { loading }] = useLazyQuery(
      OCCURENCES_BY_SUBSCRIPTION,
      {
         onCompleted: ({ subscription = {} }) => {
            if (subscription.occurences.length > 0) {
               setOccurences(subscription.occurences)
            }
         },
         onError: error => {
            addToast(error.message, {
               appearance: 'error',
            })
         },
         fetchPolicy: 'cache-and-network',
      }
   )
   //config properties
   const { configOf } = useConfig('Select-Delivery')
   const noDatesAvailable =
      configOf('delivery-day')?.Delivery?.unavailableDateLabel
   const getStartedDate = configOf('delivery-day')?.Delivery?.getStarted

   React.useEffect(() => {
      if (Object.keys(state.delivery.selected).length > 0) {
         fetchOccurences({
            variables: {
               id: state.delivery.selected.id,
               where: {
                  subscriptionOccurenceView: {
                     isValid: { _eq: true },
                     isVisible: { _eq: true },
                  },
               },
            },
         })
      }
   }, [state.delivery.selected, fetchOccurences])

   const currentLang = React.useMemo(() => locale, [locale])
   React.useEffect(() => {
      const languageTags = document.querySelectorAll(
         '[data-translation="true"]'
      )
      dynamicTrans(languageTags)
   }, [currentLang])

   const occurenceSelection = occurence => {
      const dateIndex = occurences.findIndex(node => node.id === occurence.id)
      const skipList = occurences
         .slice(0, dateIndex)
         .map(occurence => occurence.id)
      dispatch({ type: 'SET_DATE', payload: occurence })
      dispatch({ type: 'SET_SKIP_LIST', payload: skipList })
   }

   if (loading) return <Loader inline />
   if (Object.keys(state.delivery.selected).length === 0)
      return (
         <>
            <div className="hern-select-delivery__message">
               {getStartedDate?.value ? (
                  <span data-translation="true">{getStartedDate?.value}</span>
               ) : (
                  t('Select a delivery day to get started')
               )}
            </div>
         </>
      )

   if (isEmpty(occurences)) {
      return (
         <HelperBar type="warning">
            <HelperBar.SubTitle>
               {noDatesAvailable?.value ? (
                  <span data-translation="true">{noDatesAvailable?.value}</span>
               ) : (
                  t('No dates are available for delivery on this address.')
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
      <ul className="hern-delivery__delivery-date__list">
         {occurences.map(occurence => {
            const iconClasses = classNames(
               'hern-delivery__delivery-date__check-icon',
               {
                  'hern-delivery__delivery-date__check-icon--active':
                     occurence.id === state.delivery_date.selected?.id,
               }
            )
            const dateClasses = classNames(
               'hern-delivery__delivery-date__list-item',
               {
                  'hern-delivery__delivery-date__list-item--active':
                     occurence.id === state.delivery_date.selected?.id,
               }
            )
            return (
               <li
                  className={dateClasses}
                  key={occurence.id}
                  onClick={() => occurenceSelection(occurence)}
               >
                  <label className="hern-delivery__delivery-date__list-item__label">
                     {formatDate(occurence.fulfillmentDate, {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                     })}
                  </label>
               </li>
            )
         })}
      </ul>
   )
}
