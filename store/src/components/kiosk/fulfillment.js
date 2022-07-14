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
   const hidePhoneNumber =
         config?.phoneNoScreenSettings?.visibilityOfPhoneNumber?.value ?? true

   useEffect( ()=> {

      if(hidePhoneNumber){
         if(phoneNumberEyeButtonRef.current && phoneNumberInputRef.current){
            if(isEyeButtonOn){

               const phoneNumberLength = number.length
               const show =
                     config?.phoneNoScreenSettings?.phoneNumberHiddenText?.value || '*'
               phoneNumberInputRef.current.value = show.repeat(phoneNumberLength)

               phoneNumberEyeButtonRef.current.innerHTML =                
                     `<svg width="64" height="65" viewBox="0 0 64 65" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M58.32 30.9883C56.6134 28.0283 47.2267 13.1749 31.28 13.6549C16.5334 14.0283 8.00002 26.9883 5.68002 30.9883C5.44597 31.3936 5.32275 31.8535 5.32275 32.3216C5.32275 32.7897 5.44597 33.2495 5.68002 33.6549C7.36002 36.5616 16.3467 50.9883 32.0534 50.9883H32.72C47.4667 50.6149 56.0267 37.6549 58.32 33.6549C58.5541 33.2495 58.6773 32.7897 58.6773 32.3216C58.6773 31.8535 58.5541 31.3936 58.32 30.9883V30.9883ZM32.5867 45.6549C21.0934 45.9216 13.6 36.0816 11.2534 32.3216C13.92 28.0283 20.88 19.2549 31.5467 18.9883C42.9867 18.6949 50.5067 28.5616 52.88 32.3216C50.1334 36.6149 43.2534 45.3883 32.5867 45.6549V45.6549Z" fill="#303030"/>
                        <path d="M31.9998 22.9883C30.1539 22.9883 28.3494 23.5357 26.8145 24.5612C25.2797 25.5868 24.0834 27.0445 23.377 28.7499C22.6705 30.4553 22.4857 32.332 22.8458 34.1425C23.206 35.9529 24.0949 37.616 25.4002 38.9213C26.7055 40.2266 28.3685 41.1155 30.179 41.4756C31.9895 41.8357 33.8661 41.6509 35.5716 40.9445C37.277 40.2381 38.7347 39.0418 39.7602 37.5069C40.7858 35.9721 41.3332 34.1676 41.3332 32.3216C41.3332 29.8463 40.3498 27.4723 38.5995 25.722C36.8492 23.9716 34.4752 22.9883 31.9998 22.9883V22.9883ZM31.9998 36.3216C31.2087 36.3216 30.4354 36.087 29.7776 35.6475C29.1198 35.208 28.6071 34.5833 28.3043 33.8523C28.0016 33.1214 27.9224 32.3172 28.0767 31.5413C28.231 30.7653 28.612 30.0526 29.1714 29.4932C29.7308 28.9338 30.4436 28.5528 31.2195 28.3985C31.9954 28.2441 32.7997 28.3233 33.5306 28.6261C34.2615 28.9288 34.8862 29.4415 35.3257 30.0993C35.7652 30.7571 35.9998 31.5305 35.9998 32.3216C35.9998 33.3825 35.5784 34.3999 34.8283 35.15C34.0781 35.9002 33.0607 36.3216 31.9998 36.3216Z" fill="#303030"/>
                     </svg>`

            } else {

               phoneNumberInputRef.current.value = number
               phoneNumberEyeButtonRef.current.innerHTML =                
                     `<svg width="64" height="65" viewBox="0 0 64 65" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12.5597 9.09479C12.311 8.84616 12.0159 8.64893 11.691 8.51437C11.3662 8.3798 11.018 8.31055 10.6663 8.31055C10.3147 8.31055 9.96654 8.3798 9.64168 8.51437C9.31682 8.64893 9.02165 8.84616 8.77301 9.09479C8.27087 9.59693 7.98877 10.278 7.98877 10.9881C7.98877 11.6983 8.27087 12.3793 8.77301 12.8815L23.7863 27.8948C22.8365 29.6618 22.4812 31.6878 22.7732 33.6725C23.0653 35.6573 23.989 37.4951 25.4075 38.9136C26.826 40.3322 28.6639 41.2559 30.6486 41.5479C32.6334 41.8399 34.6594 41.4846 36.4263 40.5348L51.4397 55.5481C51.6876 55.7981 51.9825 55.9964 52.3075 56.1318C52.6324 56.2672 52.981 56.3369 53.333 56.3369C53.685 56.3369 54.0336 56.2672 54.3585 56.1318C54.6835 55.9964 54.9784 55.7981 55.2263 55.5481C55.4763 55.3002 55.6747 55.0053 55.8101 54.6803C55.9454 54.3554 56.0151 54.0068 56.0151 53.6548C56.0151 53.3028 55.9454 52.9542 55.8101 52.6292C55.6747 52.3043 55.4763 52.0094 55.2263 51.7615L12.5597 9.09479ZM31.9997 36.3215C30.9388 36.3215 29.9214 35.9 29.1713 35.1499C28.4211 34.3997 27.9997 33.3823 27.9997 32.3215V32.1348L32.1597 36.2948L31.9997 36.3215Z" fill="#303030"/>
                        <path d="M32.5877 45.6549C21.121 45.9216 13.601 36.0816 11.2543 32.3216C12.9249 29.6568 14.9326 27.2188 17.2277 25.0683L13.3343 21.3083C10.3245 24.1442 7.74609 27.4054 5.681 30.9883C5.44695 31.3936 5.32373 31.8535 5.32373 32.3216C5.32373 32.7897 5.44695 33.2495 5.681 33.6549C7.361 36.5616 16.3477 50.9883 32.0543 50.9883H32.721C35.6745 50.9007 38.5897 50.2959 41.3343 49.2016L37.121 44.9883C35.6393 45.378 34.1188 45.6016 32.5877 45.6549ZM58.321 30.9883C56.6143 28.0283 47.201 13.1749 31.281 13.6549C28.3275 13.7425 25.4123 14.3472 22.6677 15.4416L26.881 19.6549C28.3627 19.2651 29.8832 19.0415 31.4143 18.9883C42.8543 18.6949 50.3743 28.5616 52.7477 32.3216C51.0358 34.9944 48.983 37.4327 46.641 39.5749L50.6677 43.3349C53.7153 40.5065 56.3299 37.2448 58.4277 33.6549C58.6457 33.2402 58.7507 32.7754 58.7319 32.3073C58.7132 31.8392 58.5715 31.3842 58.321 30.9883V30.9883Z" fill="#303030"/>
                     </svg>`
            }
         }
      }
   }, [isEyeButtonOn])

   useEffect(() => {

      const show =
         config?.phoneNoScreenSettings?.phoneNumberHiddenText?.value || '*'
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

   const checkNumber = (numberText, textToAddInNumber) => {
      if(numberText.length < 12){
         setNumber(numberText+textToAddInNumber)
      }
   }

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
                  
                  { hidePhoneNumber? 
                     <span 
                        ref={phoneNumberEyeButtonRef} 
                        className="hern-kiosk__phone-number-input-toggle-button"
                        onClick={ ()=> {
                           toggleEyeButton(!isEyeButtonOn)
                        }}
                        >
                           <svg width="64" height="65" viewBox="0 0 64 65" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M58.32 30.9883C56.6134 28.0283 47.2267 13.1749 31.28 13.6549C16.5334 14.0283 8.00002 26.9883 5.68002 30.9883C5.44597 31.3936 5.32275 31.8535 5.32275 32.3216C5.32275 32.7897 5.44597 33.2495 5.68002 33.6549C7.36002 36.5616 16.3467 50.9883 32.0534 50.9883H32.72C47.4667 50.6149 56.0267 37.6549 58.32 33.6549C58.5541 33.2495 58.6773 32.7897 58.6773 32.3216C58.6773 31.8535 58.5541 31.3936 58.32 30.9883V30.9883ZM32.5867 45.6549C21.0934 45.9216 13.6 36.0816 11.2534 32.3216C13.92 28.0283 20.88 19.2549 31.5467 18.9883C42.9867 18.6949 50.5067 28.5616 52.88 32.3216C50.1334 36.6149 43.2534 45.3883 32.5867 45.6549V45.6549Z" fill="#303030"/>
                              <path d="M31.9998 22.9883C30.1539 22.9883 28.3494 23.5357 26.8145 24.5612C25.2797 25.5868 24.0834 27.0445 23.377 28.7499C22.6705 30.4553 22.4857 32.332 22.8458 34.1425C23.206 35.9529 24.0949 37.616 25.4002 38.9213C26.7055 40.2266 28.3685 41.1155 30.179 41.4756C31.9895 41.8357 33.8661 41.6509 35.5716 40.9445C37.277 40.2381 38.7347 39.0418 39.7602 37.5069C40.7858 35.9721 41.3332 34.1676 41.3332 32.3216C41.3332 29.8463 40.3498 27.4723 38.5995 25.722C36.8492 23.9716 34.4752 22.9883 31.9998 22.9883V22.9883ZM31.9998 36.3216C31.2087 36.3216 30.4354 36.087 29.7776 35.6475C29.1198 35.208 28.6071 34.5833 28.3043 33.8523C28.0016 33.1214 27.9224 32.3172 28.0767 31.5413C28.231 30.7653 28.612 30.0526 29.1714 29.4932C29.7308 28.9338 30.4436 28.5528 31.2195 28.3985C31.9954 28.2441 32.7997 28.3233 33.5306 28.6261C34.2615 28.9288 34.8862 29.4415 35.3257 30.0993C35.7652 30.7571 35.9998 31.5305 35.9998 32.3216C35.9998 33.3825 35.5784 34.3999 34.8283 35.15C34.0781 35.9002 33.0607 36.3216 31.9998 36.3216Z" fill="#303030"/>
                           </svg>
                        </span>
                     : ""
                  }
               </div>

               <div className="hern-kiosk__number-pad">
                  <div onClick={() => checkNumber(number, '1')}>1</div>
                  <div onClick={() => checkNumber(number, '2')}>2</div>
                  <div onClick={() => checkNumber(number, '3')}>3</div>
                  <div onClick={() => checkNumber(number, '4')}>4</div>
                  <div onClick={() => checkNumber(number, '5')}>5</div>
                  <div onClick={() => checkNumber(number, '6')}>6</div>
                  <div onClick={() => checkNumber(number, '7')}>7</div>
                  <div onClick={() => checkNumber(number, '8')}>8</div>
                  <div onClick={() => checkNumber(number, '9')}>9</div>
                  <div onClick={() => setNumber('')}>
                     <span className="hern-kiosk__phone-number-drawer__number__clear-btn">
                        Clear
                     </span>
                  </div>
                  <div onClick={() => checkNumber(number + '0')}>0</div>
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
