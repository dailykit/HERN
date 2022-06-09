import React, { useState } from 'react'
import { Button, Drawer } from 'antd'
import { useCart, useTranslation } from '../../context'
import { DineInIcon, TakeOutIcon } from '../../assets/icons'
import { useConfig } from '../../lib'
import moment from 'moment'
import { get_env, isDateValidInRRule, isClient } from '../../utils'
import { DineInTableSelection } from './component'

export const FulfillmentSection = props => {
   const { config, setCurrentPage } = props
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
               config?.fulfillmentPageSettings?.alignContentStart?.value
                  ? '260px'
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

   const askedPhoneNumber = config?.askPhoneNumber.value ?? false
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
         if (!askedPhoneNumber) {
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
   visible,
   setVisible,
   number,
   setNumber,
   setCurrentPage,
}) => {
   const { t } = useTranslation()
   return (
      <Drawer
         title="Enter Phone Number"
         placement={'right'}
         width={'100%'}
         onClose={() => setVisible(false)}
         visible={visible}
         style={{ zIndex: '9999' }}
         extra={
            <button
               onClick={() => {
                  setVisible(false)
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
         // TODO: svg icon should be added assets file
         closeIcon={
            <svg
               width="42"
               height="42"
               viewBox="0 0 42 42"
               fill="none"
               xmlns="http://www.w3.org/2000/svg"
            >
               <rect width="42" height="42" rx="21" fill="#7124B4" />
               <path
                  d="M31.5 21.4113H10.5M10.5 21.4113L18.7889 14.8749M10.5 21.4113L18.7889 27.1249"
                  stroke="white"
                  stroke-width="3"
                  stroke-linecap="round"
                  stroke-linejoin="round"
               />
            </svg>
         }
      >
         <div className="hern-kiosk__phone-number-drawer__content">
            {/* TODO:  This header should be config based*/}
            <div className="hern-kiosk__phone-number-drawer__header">
               <h1>Taco’bout The Order Details?</h1>
               <p>Enter Your Mobile Number &amp; Get Details On WhatsApp</p>
            </div>
            <div className="hern-kiosk__phone-number-drawer__number">
               <div className="hern-kiosk__phone-number-drawer__number__input">
                  <input
                     value={number}
                     type="text"
                     placeholder="Phone number"
                  />
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
                  <div onClick={() => setNumber(number.slice(0, -1))}>
                     {/* TODO: svg icon should be added assets file */}
                     <svg
                        width="100"
                        height="61"
                        viewBox="0 0 100 61"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                     >
                        <path
                           fill-rule="evenodd"
                           clip-rule="evenodd"
                           d="M45.9181 19.5616C46.5059 18.9738 47.3031 18.6436 48.1344 18.6436C48.9658 18.6436 49.763 18.9738 50.3508 19.5616L57 26.2108L63.6492 19.5616C64.237 18.9738 65.0342 18.6436 65.8656 18.6436C66.6969 18.6436 67.4941 18.9738 68.0819 19.5616C68.6698 20.1494 69 20.9467 69 21.778C69 22.6093 68.6698 23.4066 68.0819 23.9944L61.4328 30.6436L68.0819 37.2927C68.6698 37.8805 69 38.6778 69 39.5091C69 40.3404 68.6698 41.1377 68.0819 41.7255C67.4941 42.3133 66.6969 42.6436 65.8656 42.6436C65.0342 42.6436 64.237 42.3133 63.6492 41.7255L57 35.0763L50.3508 41.7255C49.763 42.3133 48.9658 42.6436 48.1344 42.6436C47.3031 42.6436 46.5059 42.3133 45.9181 41.7255C45.3302 41.1377 45 40.3404 45 39.5091C45 38.6778 45.3302 37.8805 45.9181 37.2927L52.5672 30.6436L45.9181 23.9944C45.3302 23.4066 45 22.6093 45 21.778C45 20.9467 45.3302 20.1494 45.9181 19.5616Z"
                           fill="#7124B4"
                        />
                        <path
                           d="M31.8285 3.1929C32.2001 2.84019 32.693 2.64355 33.2053 2.64355H96C97.1046 2.64355 98 3.53899 98 4.64355V56.6436C98 57.7481 97.1046 58.6436 96 58.6436H33.2053C32.6929 58.6436 32.2001 58.4469 31.8285 58.0942L4.43376 32.0942C3.60283 31.3056 3.60283 29.9815 4.43376 29.1929L31.8285 3.1929Z"
                           stroke="#7124B4"
                           stroke-width="4"
                        />
                     </svg>
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
