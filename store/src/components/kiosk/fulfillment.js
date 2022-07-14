import React, { useState, useRef, useEffect } from 'react'
import { Button, Drawer } from 'antd'
import { useCart, useTranslation } from '../../context'
import { DineInIcon, TakeOutIcon } from '../../assets/icons'
import { useConfig } from '../../lib'
import moment from 'moment'
import { get_env, isDateValidInRRule, isClient } from '../../utils'
import { DineInTableSelection } from './component'
import { ArrowLeftIconBG } from '../../assets/icons/ArrowLeftWithBG'
import { BackSpaceIcon } from '../../assets/icons/BackSpaceIcon'

export const FulfillmentSection = props => {
   const { config, setCurrentPage } = props
   console.log("Config: ", config)
   const {
      orderTabs,
      isConfigLoading,
      kioskAvailability,
      kioskRecurrences,
      dispatch,
   } = useConfig()
   const { t, direction, dynamicTrans, locale } = useTranslation()
   const { methods, setDineInTableInfo, storedCartId } = useCart()
   const [showDineInTableSelection, setShowDineInTableSelection] =
      useState(false)
   const [visible, setVisible] = useState(false)
   const [number, setNumber] = useState('')
   React.useEffect(() => {
      // check is there any recurrence available or not
      // if available then check that store is available for current day and time
      if (kioskRecurrences && kioskRecurrences.length > 0) {
         const now = new Date() // now
         const start = new Date(now.getTime() - 1000 * 60 * 60 * 24) // yesterday
         let ondemandPickupRecs = kioskRecurrences.filter(
            eachRec => eachRec.recurrence.type === 'ONDEMAND_PICKUP'
         )
         let ondemandPickupRecurrenceForBrandLocation =
            ondemandPickupRecs.filter(rec => rec.brandLocationId)
         if (ondemandPickupRecurrenceForBrandLocation.length > 0) {
            ondemandPickupRecs = ondemandPickupRecurrenceForBrandLocation
         }

         let ondemandDineinRecs = kioskRecurrences.filter(
            eachRec => eachRec.recurrence.type === 'ONDEMAND_DINEIN'
         )
         let ondemandDineinRecurrenceForBrandLocation =
            ondemandDineinRecs.filter(rec => rec.brandLocationId)
         if (ondemandDineinRecurrenceForBrandLocation.length > 0) {
            ondemandDineinRecs = ondemandDineinRecurrenceForBrandLocation
         }

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

   React.useEffect(() => {
      const languageTags = document.querySelectorAll(
         '[data-translation="true"]'
      )
      dynamicTrans(languageTags)
   }, [locale])
   const onTableSelectionConfirmClick = async tableInfo => {
      setDineInTableInfo(tableInfo)
      if (storedCartId) {
         await methods.cart.update({
            variables: {
               id: storedCartId,
               _set: {
                  locationTableId: orderTabs.find(
                     eachOrderTab =>
                        eachOrderTab?.orderFulfillmentTypeLabel ===
                        'ONDEMAND_DINEIN'
                  )?.id,
               },
            },
         })
      }
      dispatch({
         type: 'SET_SELECTED_ORDER_TAB',
         payload: orderTabs.find(
            eachOrderTab =>
               eachOrderTab?.orderFulfillmentTypeLabel === 'ONDEMAND_DINEIN'
         ),
      })
      setShowDineInTableSelection(false)
      setCurrentPage('menuPage')
   }
   return (
      <div
         style={{
            justifyContent: `${
               config?.fulfillmentPageSettings?.alignContentStart?.value
                  ? 'flex-start'
                  : 'center'
            }`,
            paddingTop: `${
               config?.fulfillmentPageSettings?.paddingTop?.value
                  ? config?.fulfillmentPageSettings?.paddingTop?.value
                  : 'unset'
            }`,
         }}
         className="hern-kiosk__fulfillment-section-container"
      >
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
         {config?.fulfillmentPageSettings?.mainText?.value && (
            <span
               className="hern-kiosk__fulfillment-section-main-text"
               style={{
                  color: `${config.kioskSettings.theme.primaryColor.value}`,
                  textTransform: `${
                     config?.fulfillmentPageSettings?.fulfillmentStyle?.mainText
                        ?.textTransform?.value || 'initial'
                  }`,
                  fontSize: `${
                     config?.fulfillmentPageSettings?.fulfillmentStyle?.mainText
                        ?.fontSize?.value || '6rem'
                  }`,
               }}
               data-translation="true"
            >
               {config.fulfillmentPageSettings.mainText.value}
            </span>
         )}
         <span
            className="hern-kiosk__fulfillment-section-secondary-text"
            style={{
               color: `${
                  config?.fulfillmentPageSettings?.fulfillmentStyle
                     ?.secondaryText?.color?.value ||
                  config.kioskSettings.theme.primaryColor.value
               }`,
               textTransform: `${
                  config?.fulfillmentPageSettings?.fulfillmentStyle
                     ?.secondaryText?.textTransform?.value || 'initial'
               }`,
               fontSize: `${
                  config?.fulfillmentPageSettings?.fulfillmentStyle
                     ?.secondaryText?.fontSize?.value || '4rem'
               }`,
            }}
            data-translation="true"
         >
            {config.fulfillmentPageSettings.secondaryText.value}
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
                  if (
                     config.fulfillmentPageSettings.customFulfillmentOption
                        .value
                  ) {
                     return (
                        <FulfillmentOptionCustom
                           config={config}
                           fulfillment={eachTab}
                           fulfillmentIcon={IconType}
                           buttonText={eachTab?.label}
                           key={index}
                           setCurrentPage={setCurrentPage}
                           setShowDineInTableSelection={
                              setShowDineInTableSelection
                           }
                           setVisible={setVisible}
                        />
                     )
                  }
                  return (
                     <FulfillmentOption
                        config={config}
                        fulfillment={eachTab}
                        fulfillmentIcon={IconType}
                        buttonText={eachTab?.label}
                        key={index}
                        setCurrentPage={setCurrentPage}
                        setVisible={setVisible}
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
         <DineInTableSelection
            showDineInTableSelection={showDineInTableSelection}
            onClose={() => {
               console.log('showDineInTableSelection', showDineInTableSelection)
               setShowDineInTableSelection(false)
            }}
            config={config}
            onConfirmClick={onTableSelectionConfirmClick}
         />
         <PhoneNumber
            config={config}
            visible={visible}
            number={number}
            setVisible={setVisible}
            setNumber={setNumber}
            setCurrentPage={setCurrentPage}
         />
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
         style={{
            background: `${config.kioskSettings.theme.primaryColor.value}66`,
         }}
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

const FulfillmentOptionCustom = props => {
   const {
      config,
      fulfillmentIcon: FulfillmentIcon,
      buttonText,
      setCurrentPage,
      fulfillment,
      setShowDineInTableSelection,
      setVisible,
   } = props

   const { dispatch, kioskAvailability } = useConfig()
   const { t } = useTranslation()
   const { methods } = useCart()

   const askedPhoneNumber =
      config?.phoneNoScreenSettings?.askPhoneNumber.value ?? false
   const onFulfillmentClick = () => {
      if (!kioskAvailability[fulfillment.orderFulfillmentTypeLabel]) {
         return
      }
      if (askedPhoneNumber && isClient && !localStorage.getItem('phone')) {
         setVisible(true)
      }
      if (
         config.kioskSettings.showTableSelectionView.value &&
         fulfillment.orderFulfillmentTypeLabel === 'ONDEMAND_DINEIN'
      ) {
         setShowDineInTableSelection(true)
      } else {
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
         if (
            !askedPhoneNumber ||
            (askedPhoneNumber && isClient && localStorage.getItem('phone'))
         ) {
            setCurrentPage('menuPage')
         }
      }
      isClient &&
         localStorage.setItem(
            'fulfillmentType',
            fulfillment.orderFulfillmentTypeLabel
         )
   }

   return (
      <div
         className="hern-kiosk__fulfillment-option-template-2"
         onClick={onFulfillmentClick}
         style={{
            background: `${config.kioskSettings.theme.primaryColor.value}`,
            ...(config.kioskSettings.allowTilt.value && {
               clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 97%)',
            }),
         }}
      >
         <div className="hern-kiosk_fulfillment-icon">
            {fulfillment.orderFulfillmentTypeLabel === 'ONDEMAND_PICKUP' && (
               <img
                  src={config.fulfillmentPageSettings.takeAwayIconImage.value}
                  alt="Take Away"
               />
            )}
            {fulfillment.orderFulfillmentTypeLabel === 'ONDEMAND_DINEIN' && (
               <img
                  src={config.fulfillmentPageSettings.dineInIconImage.value}
                  alt="Dine In"
               />
            )}
         </div>
         <span
            size="large"
            type="primary"
            className="hern-kiosk__kiosk-primary-button-template-2"
            style={{
               backgroundColor: `transparent`,
               size: '2em',
               color: `${config.fulfillmentPageSettings.fulfillmentTypeTextColor.value}`,
            }}
            onClick={onFulfillmentClick}
         >
            {t(buttonText)}
         </span>
      </div>
   )
}

const PhoneNumber = ({
   config,
   visible,
   setVisible,
   number,
   setNumber,
   setCurrentPage,
}) => {
   const phoneNumberInputRef = useRef()
   const phoneNumberEyeButtonRef = useRef()
   const [isEyeButtonOn, toggleEyeButton] = useState(true)
   const [isBackspace, setIsBackspace] = useState(false)
   const { t } = useTranslation()

   useEffect( ()=> {

      const hidePhoneNumber =
         config?.phoneNoScreenSettings?.visibilityOfPhoneNumber?.value ?? true
      // const hidePhoneNumber = true;
      if(hidePhoneNumber){
         if(phoneNumberEyeButtonRef.current && phoneNumberInputRef.current){
            if(isEyeButtonOn){

               const phoneNumberLength = number.length
               const show =
                     config?.phoneNoScreenSettings?.phoneNumberHiddenText?.value || '*'
               phoneNumberInputRef.current.value = show.repeat(phoneNumberLength)

               phoneNumberEyeButtonRef.current.innerHTML =                
                     `<svg width="48" height="49" viewBox="0 0 48 49" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M43.7401 23.321C42.4601 21.101 35.4201 9.96103 23.4601 10.321C12.4001 10.601 6.00014 20.321 4.26014 23.321C4.0846 23.6251 3.99219 23.97 3.99219 24.321C3.99219 24.6721 4.0846 25.017 4.26014 25.321C5.52014 27.501 12.2601 38.321 24.0401 38.321H24.5401C35.6001 38.041 42.0201 28.321 43.7401 25.321C43.9157 25.017 44.0081 24.6721 44.0081 24.321C44.0081 23.97 43.9157 23.6251 43.7401 23.321V23.321ZM24.4401 34.321C15.8201 34.521 10.2001 27.141 8.44014 24.321C10.4401 21.101 15.6601 14.521 23.6601 14.321C32.2401 14.101 37.8801 21.501 39.6601 24.321C37.6001 27.541 32.4401 34.121 24.4401 34.321V34.321Z" fill="#303030"/>
                        <path d="M24 17.3213C22.6155 17.3213 21.2622 17.7318 20.111 18.501C18.9599 19.2702 18.0627 20.3634 17.5328 21.6425C17.003 22.9216 16.8644 24.3291 17.1345 25.6869C17.4046 27.0448 18.0713 28.2921 19.0503 29.271C20.0292 30.25 21.2765 30.9167 22.6344 31.1868C23.9922 31.4569 25.3997 31.3183 26.6788 30.7884C27.9579 30.2586 29.0511 29.3614 29.8203 28.2103C30.5895 27.0591 31 25.7058 31 24.3213C31 22.4648 30.2625 20.6843 28.9498 19.3715C27.637 18.0588 25.8565 17.3213 24 17.3213V17.3213ZM24 27.3213C23.4067 27.3213 22.8266 27.1453 22.3333 26.8157C21.8399 26.4861 21.4554 26.0175 21.2284 25.4693C21.0013 24.9212 20.9419 24.318 21.0576 23.736C21.1734 23.1541 21.4591 22.6195 21.8787 22.2C22.2982 21.7804 22.8328 21.4947 23.4147 21.3789C23.9967 21.2632 24.5999 21.3226 25.1481 21.5496C25.6962 21.7767 26.1648 22.1612 26.4944 22.6546C26.8241 23.1479 27 23.7279 27 24.3213C27 25.1169 26.6839 25.88 26.1213 26.4426C25.5587 27.0052 24.7957 27.3213 24 27.3213Z" fill="#303030"/>
                     </svg>`

            } else {

               phoneNumberInputRef.current.value = number
               phoneNumberEyeButtonRef.current.innerHTML =                
                     `<svg width="48" height="49" viewBox="0 0 48 49" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M9.41988 6.90166C9.23341 6.71518 9.01203 6.56726 8.76838 6.46634C8.52474 6.36542 8.2636 6.31348 7.99988 6.31348C7.73616 6.31348 7.47503 6.36542 7.23138 6.46634C6.98774 6.56726 6.76636 6.71518 6.57988 6.90166C6.20328 7.27827 5.9917 7.78906 5.9917 8.32166C5.9917 8.85426 6.20328 9.36505 6.57988 9.74166L17.8399 21.0017C17.1275 22.3269 16.8611 23.8464 17.0801 25.335C17.2991 26.8235 17.9919 28.2019 19.0558 29.2658C20.1197 30.3297 21.498 31.0225 22.9866 31.2415C24.4751 31.4605 25.9946 31.1941 27.3199 30.4817L38.5799 41.7417C38.7658 41.9291 38.987 42.0779 39.2307 42.1794C39.4744 42.281 39.7359 42.3333 39.9999 42.3333C40.2639 42.3333 40.5253 42.281 40.769 42.1794C41.0128 42.0779 41.234 41.9291 41.4199 41.7417C41.6073 41.5557 41.7561 41.3345 41.8577 41.0908C41.9592 40.8471 42.0115 40.5857 42.0115 40.3217C42.0115 40.0576 41.9592 39.7962 41.8577 39.5525C41.7561 39.3088 41.6073 39.0876 41.4199 38.9017L9.41988 6.90166ZM23.9999 27.3217C23.2042 27.3217 22.4412 27.0056 21.8786 26.443C21.316 25.8804 20.9999 25.1173 20.9999 24.3217V24.1817L24.1199 27.3017L23.9999 27.3217Z" fill="#303030"/>
                        <path d="M24.4406 34.321C15.8406 34.521 10.2006 27.141 8.44062 24.321C9.69357 22.3224 11.1994 20.494 12.9206 18.881L10.0006 16.061C7.74328 18.188 5.80944 20.6339 4.26063 23.321C4.08509 23.6251 3.99268 23.97 3.99268 24.321C3.99268 24.6721 4.08509 25.017 4.26063 25.321C5.52063 27.501 12.2606 38.321 24.0406 38.321H24.5406C26.7557 38.2553 28.9422 37.8018 31.0006 36.981L27.8406 33.821C26.7294 34.1134 25.589 34.2811 24.4406 34.321ZM43.7406 23.321C42.4606 21.101 35.4006 9.96103 23.4606 10.321C21.2455 10.3867 19.0591 10.8403 17.0006 11.661L20.1606 14.821C21.2719 14.5287 22.4122 14.361 23.5606 14.321C32.1406 14.101 37.7806 21.501 39.5606 24.321C38.2768 26.3256 36.7371 28.1544 34.9806 29.761L38.0006 32.581C40.2863 30.4597 42.2473 28.0135 43.8206 25.321C43.9842 25.01 44.0629 24.6614 44.0488 24.3103C44.0348 23.9592 43.9285 23.618 43.7406 23.321V23.321Z" fill="#303030"/>
                     </svg>`
            }
         }
      }
   }, [isEyeButtonOn])

   useEffect(() => {
      const show =
         config?.phoneNoScreenSettings?.phoneNumberHiddenText?.value || '*'
      const hidePhoneNumber =
         config?.phoneNoScreenSettings?.visibilityOfPhoneNumber?.value ?? true
      // const hidePhoneNumber = true;
      let phoneNumberlen = number.length

      if (phoneNumberInputRef.current) {
         if (phoneNumberlen) {
            if (hidePhoneNumber && isEyeButtonOn) {
               if (!isBackspace) {
                  phoneNumberInputRef.current.value =
                     show.repeat(phoneNumberlen - 1) +
                     number[phoneNumberlen - 1]
                  setTimeout(() => {
                     phoneNumberInputRef.current.value =
                        show.repeat(phoneNumberlen)
                  }, 500)
               } else {
                  phoneNumberInputRef.current.value =
                     show.repeat(phoneNumberlen)
                  setIsBackspace(false)
               }
            } else {
               phoneNumberInputRef.current.value = number
            }
         } else {
            phoneNumberInputRef.current.value = ''
            setIsBackspace(false)
         }
      }
   }, [number])

   return (
      <Drawer
         title={t('Enter Phone Number')}
         placement={'right'}
         width={'100%'}
         onClose={() => setVisible(false)}
         visible={visible}
         style={{ zIndex: '9999' }}
         extra={
            <button
               onClick={() => {
                  setVisible(false)
                  isClient && localStorage.setItem('phone', '2222222222')
                  if (
                     isClient &&
                     localStorage.getItem('fulfillmentType') !==
                        'ONDEMAND_DINEIN'
                  ) {
                     setCurrentPage('menuPage')
                  }
               }}
               className="hern-kiosk__phone-number-drawer__skip-btn"
            >
               Skip
            </button>
         }
         className="hern-kiosk__phone-number-drawer"
         closeIcon={
            <ArrowLeftIconBG bgColor="var(--hern-primary-color)" variant="sm" />
         }
      >
         <div className="hern-kiosk__phone-number-drawer__content">
            <div className="hern-kiosk__phone-number-drawer__header">
               <h1>
                  {t(
                     config?.phoneNoScreenSettings?.title?.value ||
                        'Want to Get update about your Order Details?'
                  )}
               </h1>
               <p>
                  {t(
                     config?.phoneNoScreenSettings?.description?.value ||
                        'Enter Your Mobile Number & Get Details On WhatsApp'
                  )}
               </p>
            </div>
            <div className="hern-kiosk__phone-number-drawer__number">
               <div className="hern-kiosk__phone-number-drawer__number__input">
                  <input
                     className="hern-kiosk__phone-number-input"
                     ref={phoneNumberInputRef}
                     type="text"
                     placeholder="Phone number"
                  />
                  <span 
                     ref={phoneNumberEyeButtonRef} 
                     className="hern-kiosk__phone-number-input-toggle-button"
                     onClick={ ()=> {
                        toggleEyeButton(!isEyeButtonOn)
                     }}
                     >
                        <svg width="48" height="49" viewBox="0 0 48 49" fill="none" xmlns="http://www.w3.org/2000/svg">
                           <path d="M43.7401 23.321C42.4601 21.101 35.4201 9.96103 23.4601 10.321C12.4001 10.601 6.00014 20.321 4.26014 23.321C4.0846 23.6251 3.99219 23.97 3.99219 24.321C3.99219 24.6721 4.0846 25.017 4.26014 25.321C5.52014 27.501 12.2601 38.321 24.0401 38.321H24.5401C35.6001 38.041 42.0201 28.321 43.7401 25.321C43.9157 25.017 44.0081 24.6721 44.0081 24.321C44.0081 23.97 43.9157 23.6251 43.7401 23.321V23.321ZM24.4401 34.321C15.8201 34.521 10.2001 27.141 8.44014 24.321C10.4401 21.101 15.6601 14.521 23.6601 14.321C32.2401 14.101 37.8801 21.501 39.6601 24.321C37.6001 27.541 32.4401 34.121 24.4401 34.321V34.321Z" fill="#303030"/>
                           <path d="M24 17.3213C22.6155 17.3213 21.2622 17.7318 20.111 18.501C18.9599 19.2702 18.0627 20.3634 17.5328 21.6425C17.003 22.9216 16.8644 24.3291 17.1345 25.6869C17.4046 27.0448 18.0713 28.2921 19.0503 29.271C20.0292 30.25 21.2765 30.9167 22.6344 31.1868C23.9922 31.4569 25.3997 31.3183 26.6788 30.7884C27.9579 30.2586 29.0511 29.3614 29.8203 28.2103C30.5895 27.0591 31 25.7058 31 24.3213C31 22.4648 30.2625 20.6843 28.9498 19.3715C27.637 18.0588 25.8565 17.3213 24 17.3213V17.3213ZM24 27.3213C23.4067 27.3213 22.8266 27.1453 22.3333 26.8157C21.8399 26.4861 21.4554 26.0175 21.2284 25.4693C21.0013 24.9212 20.9419 24.318 21.0576 23.736C21.1734 23.1541 21.4591 22.6195 21.8787 22.2C22.2982 21.7804 22.8328 21.4947 23.4147 21.3789C23.9967 21.2632 24.5999 21.3226 25.1481 21.5496C25.6962 21.7767 26.1648 22.1612 26.4944 22.6546C26.8241 23.1479 27 23.7279 27 24.3213C27 25.1169 26.6839 25.88 26.1213 26.4426C25.5587 27.0052 24.7957 27.3213 24 27.3213Z" fill="#303030"/>
                        </svg>
                     </span>
               </div>

               <div className="hern-kiosk__number-pad">
                  <div onClick={() => setNumber(number + '1')}>1</div>
                  <div onClick={() => setNumber(number + '2')}>2</div>
                  <div onClick={() => setNumber(number + '3')}>3</div>
                  <div onClick={() => setNumber(number + '4')}>4</div>
                  <div onClick={() => setNumber(number + '5')}>5</div>
                  <div onClick={() => setNumber(number + '6')}>6</div>
                  <div onClick={() => setNumber(number + '7')}>7</div>
                  <div onClick={() => setNumber(number + '8')}>8</div>
                  <div onClick={() => setNumber(number + '9')}>9</div>
                  <div onClick={() => setNumber('')}>
                     <span className="hern-kiosk__phone-number-drawer__number__clear-btn">
                        Clear
                     </span>
                  </div>
                  <div onClick={() => setNumber(number + '0')}>0</div>
                  <div
                     onClick={() => {
                        setNumber(number.slice(0, -1))
                        setIsBackspace(true)
                     }}
                  >
                     <BackSpaceIcon />
                  </div>
               </div>
               <button
                  onClick={() => {
                     isClient &&
                        number.length > 0 &&
                        localStorage.setItem('phone', number)
                     setVisible(false)
                     if (
                        isClient &&
                        localStorage.getItem('fulfillmentType') !==
                           'ONDEMAND_DINEIN'
                     ) {
                        setCurrentPage('menuPage')
                     }
                  }}
                  disabled={number.length < 10}
                  className="hern-kiosk__phone-number-drawer__number__proceed-btn"
               >
                  {t('Proceed')}
               </button>
            </div>
         </div>
      </Drawer>
   )
}
