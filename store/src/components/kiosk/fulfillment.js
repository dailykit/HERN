import React from 'react'
import { Button } from 'antd'
import { useCart, useTranslation } from '../../context'
import { DineInIcon, TakeOutIcon } from '../../assets/icons'
import { useConfig } from '../../lib'
import moment from 'moment'
import { isDateValidInRRule } from '../../utils'

export const FulfillmentSection = props => {
   const { config, setCurrentPage } = props
   const {
      orderTabs,
      isConfigLoading,
      kioskAvailability,
      kioskRecurrences,
      dispatch,
   } = useConfig()
   const { t, direction } = useTranslation()
   console.log('config', config)
   React.useEffect(() => {
      // check is there any recurrence available or not
      // if available then check that store is available for current day and time
      if (kioskRecurrences && kioskRecurrences.length > 0) {
         const now = new Date() // now
         const start = new Date(now.getTime() - 1000 * 60 * 60 * 24) // yesterday
         const ondemandPickupRecs = kioskRecurrences.filter(
            eachRec => eachRec.recurrence.type === 'ONDEMAND_PICKUP'
         )
         const ondemandDineinRecs = kioskRecurrences.filter(
            eachRec => eachRec.recurrence.type === 'ONDEMAND_DINEIN'
         )
         // return a boolean value for store available or not
         const recurrencesValidation = recurrences => {
            for (let i = 0; i <= recurrences.length - 1; i++) {
               // check current day is valid for rrule
               const isValidDay = isDateValidInRRule(
                  recurrences[i].recurrence.rrule
               )
               if (isValidDay) {
                  // check time slots available or not
                  // if available then check current time is valid or not
                  if (recurrences[i].recurrence.timeSlots.length) {
                     let storeAvailability = false
                     for (let timeslot of recurrences[i].recurrence.timeSlots) {
                        const currentTime = moment()
                        const openingTime = moment(timeslot.from, 'HH:mm:ss')
                        const closingTime = moment(timeslot.to, 'HH:mm:ss')
                        storeAvailability = currentTime.isBetween(
                           openingTime,
                           closingTime,
                           'minutes',
                           []
                        )
                        if (storeAvailability) {
                           return storeAvailability
                        }
                     }
                  } else {
                     // when no time slots available
                     return true
                  }
               } else {
                  if (i == recurrences.length - 1) return false
               }
            }
         }
         const isOndemandPickupValid = recurrencesValidation(ondemandPickupRecs)
         const isOndemandDineinValid = recurrencesValidation(ondemandDineinRecs)

         dispatch({
            type: 'SET_KIOSK_AVAILABILITY',
            payload: {
               ONDEMAND_PICKUP: Boolean(isOndemandPickupValid),
               ONDEMAND_DINEIN: Boolean(isOndemandDineinValid),
               isValidated: true,
            },
         })
      } else {
         // if there is no rec. available then store will available
         dispatch({
            type: 'SET_KIOSK_AVAILABILITY',
            payload: {
               ONDEMAND_PICKUP: true,
               ONDEMAND_DINEIN: true,
               isValidated: true,
            },
         })
      }
   }, [kioskRecurrences])
   return (
      <div className="hern-kiosk__fulfillment-section-container">
         {config.fulfillmentPageSettings.backgroundImage.value.url[0] && (
            <img
               className="hern-kiosk__fulfillment-section-bg-image"
               src={config.fulfillmentPageSettings.backgroundImage.value.url[0]}
               alt="bg-image"
               style={{
                  filter: config.fulfillmentPageSettings
                     .showFulfillmentPageBgImageBlur.value
                     ? 'blur(6px)'
                     : 'unset',
               }}
            />
         )}
         <span
            className="hern-kiosk__fulfillment-section-text"
            style={{
               color: `${config.kioskSettings.theme.primaryColor.value}`,
            }}
         >
            {t('Where will you be eating today?')}
         </span>
         <div className="hern-kiosk__fulfillment-options" dir={direction}>
            {isConfigLoading ? (
               <p>loading</p>
            ) : (
               orderTabs.map((eachTab, index) => {
                  let IconType = null
                  switch (eachTab?.orderFulfillmentTypeLabel) {
                     case 'ONDEMAND_PICKUP':
                        IconType = TakeOutIcon
                        break
                     case 'ONDEMAND_DINEIN':
                        IconType = DineInIcon
                        break
                  }
                  return (
                     <FulfillmentOption
                        config={config}
                        fulfillment={eachTab}
                        fulfillmentIcon={IconType}
                        buttonText={eachTab?.label}
                        key={index}
                        setCurrentPage={setCurrentPage}
                     />
                  )
               })
            )}
         </div>
         {!kioskAvailability['ONDEMAND_PICKUP'] &&
            !kioskAvailability['ONDEMAND_DINEIN'] && (
               <div className="hern-kiosk__fulfillment-view-menu-btn-wrapper">
                  <Button
                     size="large"
                     type="primary"
                     className="hern-kiosk__kiosk-primary-button"
                     style={{
                        backgroundColor: `${config.kioskSettings.theme.primaryColor.value}`,
                     }}
                     onClick={() => {
                        setCurrentPage('menuPage')
                     }}
                  >
                     <span>{t('View Menu')}</span>
                  </Button>
               </div>
            )}
      </div>
   )
}

const FulfillmentOption = props => {
   const {
      config,
      fulfillmentIcon: FulfillmentIcon,
      buttonText,
      setCurrentPage,
      fulfillment,
   } = props

   const { dispatch, kioskAvailability } = useConfig()
   const { t } = useTranslation()
   const { methods } = useCart()

   const onFulfillmentClick = () => {
      if (!kioskAvailability[fulfillment.orderFulfillmentTypeLabel]) {
         return
      }
      dispatch({
         type: 'SET_SELECTED_ORDER_TAB',
         payload: fulfillment,
      })
      const cartIdInLocal = localStorage.getItem('cart-id')
      if (cartIdInLocal) {
         methods.cart.update({
            variables: {
               id: JSON.parse(cartIdInLocal),
               _set: {
                  orderTabId: fulfillment?.id || null,
               },
            },
         })
      }
      setCurrentPage('menuPage')
   }

   return (
      <div
         className="hern-kiosk__fulfillment-option"
         onClick={onFulfillmentClick}
      >
         <div className="hern-kiosk_fulfillment-icon">
            <FulfillmentIcon width={200} height={200} fill="#ffffff" />
         </div>
         <Button
            size="large"
            type="primary"
            className="hern-kiosk__kiosk-primary-button"
            style={{
               backgroundColor: `${
                  config.kioskSettings.theme.primaryColor.value
               }${
                  kioskAvailability[fulfillment.orderFulfillmentTypeLabel]
                     ? ''
                     : '99'
               }`,
            }}
            onClick={onFulfillmentClick}
         >
            <span>{t(buttonText)}</span>
         </Button>
      </div>
   )
}
