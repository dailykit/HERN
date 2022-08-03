import React from 'react'
import { Button, Modal } from 'antd'
import { useCart, useTranslation } from '../../context'
import { DineInIcon, TakeOutIcon } from '../../assets/icons'
import { useConfig } from '../../lib'
import moment from 'moment'
import { isDateValidInRRule, isClient } from '../../utils'
import tw from 'twin.macro'
import styled from 'styled-components'

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

   return (
      <div
         tw="fixed inset-0 top-[160px]"
         className="animate__animated animate__slideInRight"
      >
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
                  src={
                     config.fulfillmentPageSettings.backgroundImage.value.url[0]
                  }
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
                  className="hern-kiosk__fulfillment-section-main-text animate__animated animate__bounce animation-fill-none"
                  style={{
                     color: `${config.kioskSettings.theme.primaryColor.value}`,
                     textTransform: `${
                        config?.fulfillmentPageSettings?.fulfillmentStyle
                           ?.mainText?.textTransform?.value || 'initial'
                     }`,
                     fontSize: `${
                        config?.fulfillmentPageSettings?.fulfillmentStyle
                           ?.mainText?.fontSize?.value || '6rem'
                     }`,
                  }}
                  data-translation="true"
               >
                  {config.fulfillmentPageSettings.mainText.value}
               </span>
            )}
            <span
               className="hern-kiosk__fulfillment-section-secondary-text animation-fill-none animate__animated animate__lightSpeedInLeft animate__delay-1s"
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
         <PhoneNumberTunnel
            config={config}
            visible={visible}
            setVisible={setVisible}
            setCurrentPage={setCurrentPage}
            triggeredFrom={"fulfillmentPage"}
         />
         <PromotionalScreen
            config={config}
            setCurrentPage={setCurrentPage}
            visible={isPromotionalScreenVisible}
            setVisible={setIsPromotionalScreenVisible}
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
      showPromotionalScreen,
   } = props

   const { dispatch, kioskAvailability } = useConfig()
   const { t } = useTranslation()
   const { methods } = useCart()
   const [toPayInCashModal, setToPayInCashModal] = React.useState(false)
   const showPayInCashModal =
      config?.fulfillmentPageSettings?.payInCashModal?.showPayInCashModal
         ?.value ?? false
   const askedPhoneNumber =
      config?.phoneNoScreenSettings?.askPhoneNumber.value ?? false

   const handleFulfillment = () => {
      if (!kioskAvailability[fulfillment.orderFulfillmentTypeLabel]) {
         return
      }
      if (askedPhoneNumber) {
         setCurrentPage('phonePage')
      } else if (
         config.kioskSettings.showTableSelectionView.value &&
         fulfillment.orderFulfillmentTypeLabel === 'ONDEMAND_DINEIN'
      ) {
         setCurrentPage('tableSelectionPage')
      } else {
         if (showPromotionalScreen) {
            setCurrentPage('promotionalPage')
         } else {
            setCurrentPage('menuPage')
         }
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
   }
   const onFulfillmentClick = () => {
      if (showPayInCashModal) {
         setToPayInCashModal(true)
      } else {
         handleFulfillment()
      }
      isClient &&
         localStorage.setItem(
            'fulfillmentType',
            fulfillment.orderFulfillmentTypeLabel
         )
   }

   return (
      <>
         <div
            className="hern-kiosk__fulfillment-option-template-2 animate__animated animate__fadeInUp animate__delay-2s animate__faster"
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
                     src={
                        config.fulfillmentPageSettings.takeAwayIconImage.value
                     }
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
         <PayInCashModal
            config={config}
            toPayInCashModal={toPayInCashModal}
            setToPayInCashModal={setToPayInCashModal}
            handleFulfillment={handleFulfillment}
         />
      </>
   )
}

const PayInCashModal = ({
   config,
   toPayInCashModal,
   setToPayInCashModal,
   handleFulfillment,
}) => {
   const payInCashModalConfig = {
      title:
         config?.fulfillmentPageSettings?.payInCashModal?.title?.value ||
         'To pay in cash, request to place the order at the counter',
      illustrationImage:
         config?.fulfillmentPageSettings?.payInCashModal?.illustrationImage
            ?.value ||
         'https://dailykit-133-test.s3.us-east-2.amazonaws.com/images/95028-pay%20at%20counter.png',
      continueButtonLabel:
         config?.fulfillmentPageSettings?.payInCashModal?.continueButtonLabel
            ?.value || 'Continue',
   }
   const { title, illustrationImage, continueButtonLabel } =
      payInCashModalConfig
   return (
      <StyledPayInCashModal
         title={null}
         visible={toPayInCashModal}
         centered={true}
         onCancel={() => {
            setToPayInCashModal(false)
            handleFulfillment()
         }}
         closable={false}
         footer={null}
      >
         <div tw="relative flex items-center flex-col">
            <div tw="w-[500px] min-h-[360px]">
               <img width={500} height="auto" src={illustrationImage} alt="" />
            </div>

            <h3 tw="text-3xl font-bold pt-16 pb-20  px-12 text-center tracking-wider">
               {title}
            </h3>
            <button
               onClick={() => setToPayInCashModal(false)}
               tw="absolute top-12 right-12"
            >
               <svg
                  width="57"
                  height="56"
                  viewBox="0 0 57 56"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
               >
                  <circle
                     cx="28.5"
                     cy="28"
                     r="26"
                     fill="white"
                     stroke="#702082"
                     stroke-width="4"
                  />
                  <path
                     fill-rule="evenodd"
                     clip-rule="evenodd"
                     d="M19.2651 18.765C19.755 18.2752 20.4194 18 21.1121 18C21.8049 18 22.4693 18.2752 22.9591 18.765L28.5001 24.306L34.0411 18.765C34.5309 18.2752 35.1953 18 35.8881 18C36.5808 18 37.2452 18.2752 37.735 18.765C38.2249 19.2549 38.5001 19.9193 38.5001 20.612C38.5001 21.3048 38.2249 21.9692 37.735 22.459L32.1941 28L37.735 33.541C38.2249 34.0308 38.5001 34.6952 38.5001 35.388C38.5001 36.0807 38.2249 36.7451 37.735 37.235C37.2452 37.7248 36.5808 38 35.8881 38C35.1953 38 34.5309 37.7248 34.0411 37.235L28.5001 31.694L22.9591 37.235C22.4693 37.7248 21.8049 38 21.1121 38C20.4194 38 19.755 37.7248 19.2651 37.235C18.7753 36.7451 18.5001 36.0807 18.5001 35.388C18.5001 34.6952 18.7753 34.0308 19.2651 33.541L24.8061 28L19.2651 22.459C18.7753 21.9692 18.5001 21.3048 18.5001 20.612C18.5001 19.9193 18.7753 19.2549 19.2651 18.765Z"
                     fill="#702082"
                  />
               </svg>
            </button>

            <Button
               onClick={() => {
                  setToPayInCashModal(false)
                  handleFulfillment()
               }}
               style={{
                  border: `4px solid var(--hern-primary-color)`,
                  whiteSpace: 'nowrap',
               }}
               className="animate__animated animate__shakeX animate__delay-3s animate__infinite"
               tw="text-3xl font-bold text-[var(--hern-primary-color)] py-6 h-auto w-full mb-20 max-w-[520px]"
            >
               {continueButtonLabel}
            </Button>
         </div>
      </StyledPayInCashModal>
   )
}

const StyledPayInCashModal = styled(Modal)`
   width: 800px !important;
   display: flex;
   justify-content: center;
   clip-path: polygon(0 0, 100% 0, 100% 100%, 0 94.76%);
`
