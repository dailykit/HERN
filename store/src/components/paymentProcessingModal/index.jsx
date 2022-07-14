import tw from 'twin.macro'
import React, { useState, useEffect } from 'react'
import Confetti from 'react-confetti'
import { useRouter } from 'next/router'
import { Result, Spin, Button, Modal } from 'antd'
import isEmpty from 'lodash/isEmpty'
import Countdown from 'react-countdown'
import { Wrapper } from './styles'
import { Button as StyledButton } from '../button'
import PayButton from '../PayButton'
import {
   ArrowLeftIconBG,
   ArrowLeftIcon,
   RoundedCloseIcon,
   PaymentOptionIcon,
} from '../../assets/icons'
import {
   useWindowSize,
   isKiosk,
   formatTerminalStatus,
   isClient,
   formatCurrency,
} from '../../utils'
import { useTranslation, useUser } from '../../context'
import { useConfig } from '../../lib'
import qrcode from 'qrcode'

const PaymentProcessingModal = ({
   isOpen,
   cartPayment,
   cartId,
   PaymentOptions,
   closeModal = () => null,
   normalModalClose = () => null,
   cancelPayment = () => null,
   isTestingByPass = false,
   byPassTerminalPayment = () => null,
   cancelTerminalPayment = () => null,
   initializePrinting = () => null,
   resetPaymentProviderStates = () => null,
   setIsProcessingPayment = () => null,
   setIsPaymentInitiated = () => null,
}) => {
   const router = useRouter()
   const isKioskMode = isKiosk()
   const [isCelebrating, setIsCelebrating] = useState(false)
   const { width, height } = useWindowSize()
   const [countDown, setCountDown] = useState(null)
   const { t } = useTranslation()
   const { user } = useUser()
   const PaymentPopUpDesignConfig = useConfig('KioskConfig')?.KioskConfig
   const variant = PaymentPopUpDesignConfig?.cartPageSettings?.congratulationTunnel.variant.value.value
   
   const closeModalHandler = async () => {
      setIsCelebrating(false)
      await closeModal()
      // await resetPaymentProviderStates()
   }
   const resetStateAfterModalClose = async ({ showChoosePayment = false }) => {
      setIsCelebrating(false)
      await closeModal()
      await resetPaymentProviderStates()
      if (showChoosePayment) {
         setIsProcessingPayment(true)
         setIsPaymentInitiated(true)
      }
   }

   const stopCelebration = async () => {
      setIsCelebrating(false)
      if (isKioskMode) {
         // initializePrinting()
         await closeModalHandler()
      } else {
         await closeModalHandler()
         setIsProcessingPayment(false)
         setIsPaymentInitiated(false)
         if (cartPayment?.cartId) {
            if (cartPayment?.cart.source === 'subscription') {
               if (user?.isSubscriber) {
                  router.push(`/placing-order?id=${cartPayment?.cartId}`)
               }
               router.push(
                  `/get-started/placing-order?id=${cartPayment?.cartId}`
               )
            } else {
               if (router.pathname !== `/view-order`) {
                  router.push(`/view-order?id=${cartPayment?.cartId}`)
               }
            }
         }
      }
   }
   const startCelebration = () => {
      setIsCelebrating(true)
      setTimeout(async () => {
         await stopCelebration()
      }, 5000)
   }

   const ShowPaymentStatusInfo = () => {

      let icon = (
         <img
            src="/assets/gifs/paymentProcessing.gif"
            className="payment_status_loader"
         />
      )

      let title = 'Processing your payment'
      let subtitle = (
         <>
            <p>{t('Please wait while we process your payment')}</p>
            <br />
            <p>{t('Please do not refresh or reload the page')}</p>
            <br />
            <p>{t("you'll be automatically redirected")}</p>
         </>
      )
      let extra = null
      if (isKioskMode) {
         icon = (
            <img
               src="/assets/gifs/kioskLoader.gif"
               className="payment_status_loader"
            />
         )
         title = 'Processing your order'
         subtitle = t('Please wait while we process your order')
         if (cartPayment?.paymentStatus === 'PENDING') {
            icon = (
               <img
                  src="/assets/gifs/kioskLoader.gif"
                  className="payment_status_loader"
               />
            )
            title = 'Processing your order'
            subtitle = t('Please wait while we process your order')
         } else if (cartPayment?.paymentStatus === 'SUCCEEDED') {
            
            if(variant === "customized"){
               icon = (
                  <>
                     <img
                        src="/assets/gifs/success.gif"
                        className="payment_status_loader"
                     />
                     <div style={{color:'white', paddingBottom: '2rem', fontFamily: 'Nunito Sans'}}>
                        <p style={{fontSize: '1.5rem'}}>{t('Your Payment is Complete')}</p>
                        <h1 style={{color: 'white', fontSize: '3rem'}}>{t('Thank You!')}</h1>
                     </div>
                  </>
               )
               title = 'Your Order Is Placed Successfully.'
               subtitle = (
                  <>
                     <p style={{fontSize: '1.5rem', color: 'black'}}>{t('Your Order Id')}</p>
                     <h1 style={{fontSize: '2rem', color: '#7124B4', fontWeight: '900'}}>{t(`${cartId}`)}</h1>
                     <p style={{fontSize: '1rem', color: 'black'}}>{t('Check your whatsapp for order confirmation')}</p>
                  </>
               )
            } else if(variant === "simple"){
               icon = (
                  <img
                     src="/assets/gifs/successful.gif"
                     className="payment_status_loader"
                  />
               )
               title = 'Successfully placed your order'
               subtitle = t('You will be redirected to your order page shortly')
            }
            
         } else if (cartPayment?.paymentStatus === 'FAILED') {
            icon = (
               <img
                  src="/assets/gifs/payment_fail.gif"
                  className="payment_status_loader"
               />
            )
            title = 'Payment Failed'
            subtitle = t(
               formatTerminalStatus[cartPayment.transactionRemark?.StatusCode]
                  ?.message || 'Unknown error'
            )
            extra = [
               <Button
                  type="primary"
                  className="tryOtherPayment"
                  key="console"
                  onClick={() => {
                     cancelTerminalPayment({
                        cartPayment,
                        retryPaymentAttempt: false,
                     })
                  }}
               >
                  {t('Try again')}
               </Button>,
               <Button
                  type="primary"
                  className="tryOtherPayment"
                  key="console"
                  onClick={() =>
                     resetStateAfterModalClose({ showChoosePayment: true })
                  }
               >
                  {t('Try other payment method')}
               </Button>,
            ]
         } else if (cartPayment?.paymentStatus === 'CANCELLED') {
            icon = (
               <img
                  src="/assets/gifs/payment_fail.gif"
                  className="payment_status_loader"
               />
            )
            title = 'Payment Cancelled'
            subtitle = t('You cancelled your payment process')
            extra = [
               <Button
                  type="primary"
                  className="tryOtherPayment"
                  key="console"
                  onClick={() =>
                     resetStateAfterModalClose({ showChoosePayment: true })
                  }
               >
                  {t('Try other payment method')}
               </Button>,
            ]
         } else if (cartPayment?.paymentStatus === 'SWIPE_CARD') {
            icon = (
               <img
                  src="/assets/gifs/swipe_card.gif"
                  className="payment_status_loader"
               />
            )
            title = 'Swipe or Insert your card'
            subtitle = t(
               'Please swipe or insert your card to complete the payment'
            )
         } else if (cartPayment?.paymentStatus === 'ENTER_PIN') {
            icon = (
               <img
                  src="/assets/gifs/swipe_card.gif"
                  className="payment_status_loader"
               />
            )
            title = 'Enter your pin'
            subtitle = t('Please your pin to complete the payment')
         } else if (cartPayment?.paymentStatus === 'QR_GENERATED'){
            icon = (
               <div className="qr_code_card" style={{
               }}>
                  <p className="msg my-2" style={{
                  }}>Scan QR code to make payment</p>
                  <img
                     src={cartPayment?.actionUrl}
                     tw="height[400px] width[400px] mx-auto"
                     className="qr_code"
                  />
                  <p className="total_amount" style={{
                  }}>Total Amount: {formatCurrency(cartPayment.amount)}</p>
               </div>
            )
            title = ''
            subtitle = t('')
            extra = [
               <p
                  style={{
                     color: PaymentPopUpDesignConfig
                        .paymentPopupSettings.textColor.value,
                  }}
                  tw="last:(hidden) font-extrabold margin[2rem 0] text-4xl text-center"
               >
                  {t('OR')}
               </p>,
               <button
                  type="primary"
                  style={{
                     padding: "20px 0px",
                     width: "100%",
                     fontSize: "28px",
                     lineHeight: "40px",
                     borderRadius: "0.2em",
                     backgroundColor: PaymentPopUpDesignConfig.paymentPopupSettings.textColor.value,
                     color: PaymentPopUpDesignConfig.paymentPopupSettings.paymentTitleColor.value,
                     textTransform: "uppercase"
                  }}
                  key="console"
                  onClick={() =>
                     resetStateAfterModalClose({ showChoosePayment: true })
                  }
               >
                  {t('Try other payment method')}
               </button>
            ]
         } else if (
            ![
               'SUCCEEDED',
               'FAILED',
               'CANCELLED',
               'SWIPE_CARD',
               'ENTER_PIN',
               'QR_GENERATED'
            ].includes(cartPayment?.paymentStatus)
         ) {
            icon = (
               <img
                  src="/assets/gifs/payment_fail.gif"
                  className="payment_status_loader"
               />
            )
            title =
               formatTerminalStatus[cartPayment.transactionRemark?.StatusCode]
                  ?.status
            subtitle =
               formatTerminalStatus[cartPayment.transactionRemark?.StatusCode]
                  ?.message
         }
      } else {
         if (cartPayment?.paymentStatus === 'SUCCEEDED') {
            if(variant === "customized"){
               icon = (
                  <>
                     <img
                        src="/assets/gifs/success.gif"
                        className="payment_status_loader"
                     />
                     <div style={{color:'white', paddingBottom: '2rem', fontFamily: 'Nunito Sans'}}>
                        <p style={{fontSize: '1.5rem'}}>{t('Your Payment is Complete')}</p>
                        <h1 style={{color: 'white', fontSize: '3rem'}}>{t('Thank You!')}</h1>
                     </div>
                  </>
               )
               title = 'Your Order Is Placed Successfully.'
               subtitle = (
                  <>
                     <p style={{fontSize: '1.5rem', color: 'black'}}>{t('Your Order Id')}</p>
                     <h1 style={{fontSize: '2rem', color: '#7124B4', fontWeight: '900'}}>{t(`${cartId}`)}</h1>
                     <p style={{fontSize: '1rem', color: 'black'}}>{t('Check your whatsapp for order confirmation')}</p>
                  </>
               )
            } else if(variant === "simple"){
               icon = (
                  <img
                     src="/assets/gifs/successful.gif"
                     className="payment_status_loader"
                  />
               )
               title = 'Successfully placed your order'
               subtitle = t('You will be redirected to your order page shortly')
            }
         } else if (cartPayment?.paymentStatus === 'REQUIRES_ACTION') {
            icon = (
               <img
                  src="/assets/gifs/authentication.gif"
                  className="payment_status_loader"
               />
            )
            title = 'Looks like your card requires authentication'
            subtitle = t(
               'An additional verification step which direct you to an authentication page on your bank’s website'
            )
            extra = [
               <Button
                  type="primary"
                  className="authenticateBtn"
                  href={cartPayment?.actionUrl}
                  target="_blank"
               >
                  {t('Authenticate Here')}
               </Button>,
               <Button type="link" danger onClick={cancelPayment}>
                  {t('Cancel Payment')}
               </Button>,
            ]
         } else if (cartPayment?.paymentStatus === 'FAILED') {
            icon = (
               <img
                  src="/assets/gifs/payment_fail.gif"
                  className="payment_status_loader"
               />
            )
            title = 'Payment Failed'
            subtitle = t('Something went wrong')
            extra = [
               <Button
                  type="primary"
                  className="tryOtherPayment"
                  key="console"
                  onClick={resetStateAfterModalClose}
               >
                  {t('Try other payment method')}
               </Button>,
            ]
         } else if (cartPayment?.paymentStatus === 'CANCELLED') {
            icon = (
               <img
                  src="/assets/gifs/payment_fail.gif"
                  className="payment_status_loader"
               />
            )
            title = 'Payment Cancelled'
            subtitle = t('You cancelled your payment process')
            extra = [
               <Button
                  type="primary"
                  className="tryOtherPayment"
                  key="console"
                  onClick={resetStateAfterModalClose}
               >
                  {t('Try other payment method')}
               </Button>,
            ]
         } else if (cartPayment?.paymentStatus === 'REQUIRES_PAYMENT_METHOD') {
            icon = (
               <img
                  src="/assets/gifs/payment_fail.gif"
                  className="payment_status_loader"
               />
            )
            title = 'Payment Failed'
            subtitle = t(
               "Your payment is failed since your bank doesn't authenticate you"
            )
            extra = [
               <Button
                  type="primary"
                  className="tryOtherPayment"
                  key="console"
                  onClick={resetStateAfterModalClose}
               >
                  {t('Try other payment method')}
               </Button>,
            ]
         }
      }

      return {
         icon,
         title,
         subtitle,
         extra,
      }
   }

   useEffect(() => {
      if (!isEmpty(cartPayment)) {
         // start celebration (confetti effect) once payment is successful
         if (cartPayment?.paymentStatus === 'SUCCEEDED') {
            startCelebration()
         } else if (
            // start the timeout to cancel the payment if payment is not successful/cancelled/failed/QR_GENERATED
            !['SUCCEEDED', 'FAILED', 'CANCELLED', 'QR_GENERATED'].includes(
               cartPayment?.paymentStatus
            )
         ) {
            isKioskMode
               ? setCountDown(Date.now() + 1 * 60000)
               : setCountDown(Date.now() + 5 * 60000)
         }
      }
   }, [cartPayment?.paymentStatus])

   // resetting countdown timer when payment status changes
   // useEffect(() => {
   //    setCountDown(60)
   // }, [cartPayment?.paymentStatus])

   
   const arrowBgColor =
      PaymentPopUpDesignConfig?.kioskSettings?.theme?.arrowBgColor?.value
   const arrowColor =
      PaymentPopUpDesignConfig?.kioskSettings?.theme?.arrowColor?.value
   return (
      <Modal
         title={null}
         visible={isOpen}
         footer={null}
         closable={false}
         keyboard={false}
         maskClosable={false}
         centered
         width={isKioskMode ? 800 : 'auto'}
         onCancel={closeModalHandler}
         zIndex={10000}
         className="hern-kiosk-payment-modal"
         bodyStyle={{
            maxHeight: '100%',
            height: isKioskMode ? '100%' : 'calc(100vh - 16px)',
            width: '100%',
            overflowY: 'auto',
         }}
         maskStyle={{
            backgroundColor: isKioskMode
               ? PaymentPopUpDesignConfig?.paymentPopupSettings
                    ?.paymentPopupBackgroundColor?.value
               : '#fff',
         }}
      >
         <CartPageHeader
            resetPaymentProviderStates={resetPaymentProviderStates}
            closeModal={closeModal}
            isCartPaymentEmpty={isEmpty(cartPayment)}
         />
         {/* this payment option selection screen and back button, it will only show in kiosk app  */}
         {isKioskMode && isEmpty(cartPayment) ? (
            <>
               <Wrapper>
                  <button
                     onClick={() => setIsProcessingPayment(false)}
                     className="hern-kiosk__payment-modal-close"
                  >
                     <RoundedCloseIcon />
                  </button>
                  <div tw="flex flex-col">
                     {/* <h1 tw ="font-extrabold text-4xl text-center margin[2rem 0]"> */}
                     <h1
                        style={{
                           color: PaymentPopUpDesignConfig.paymentPopupSettings
                              .textColor.value,
                        }}
                        tw="font-bold text-4xl text-center margin[3.5rem 0 5rem 0]"
                     >
                        {t('Choose a payment method')}
                     </h1>
                     <div
                        style={{
                           display: 'grid',
                           gridTemplateColumns: 'repeat(auto-fit,220px)',
                           gridGap: '1.5rem',
                           justifyContent: 'center',
                           alignContent: 'center',
                        }}
                     >
                        {PaymentOptions.map(option => {
                           return (
                              <>
                                 <PayButton
                                    cartId={cartId}
                                    className="hern-kiosk__kiosk-button hern-kiosk__cart-place-order-btn"
                                    key={option.id}
                                    selectedAvailablePaymentOptionId={option.id}
                                    config={PaymentPopUpDesignConfig}
                                 >
                                    <PaymentOptionIcon
                                       color="var(--hern-primary-color)"
                                       identifier={option.identifier}
                                    />
                                    <span> {t(option.label)}</span>
                                 </PayButton>
                              </>
                           )
                        })}
                     </div>
                  </div>
               </Wrapper>
               {/* <Button
                  type="link"
                  tw="fixed top-8 left-4"
                  onClick={resetPaymentProviderStates}
               >
                  <div tw="flex items-center">
                     <ArrowLeftIconBG
                        bgColor={`${arrowBgColor}`}
                        arrowColor={arrowColor}
                     />
                     <span tw="ml-4 font-bold text-white text-2xl">Back</span>
                  </div>
               </Button> */}
            </>
         ) : (
            <Wrapper variant={variant}>
               <Result
                  icon={ShowPaymentStatusInfo().icon}
                  title={t(ShowPaymentStatusInfo().title)}
                  subTitle={ShowPaymentStatusInfo().subtitle}
                  extra={ShowPaymentStatusInfo().extra}
               />

               {isCelebrating === 'success' && <Confetti />}
            </Wrapper>
         )}

         {/* this is the bypass payment button to make the payment success or failed for testing purpose */}
         {isKioskMode &&
            isTestingByPass &&
            ['SUCCEEDED', 'FAILED', 'CANCELLED', 'QR_GENERATED'].includes(
               cartPayment?.paymentStatus
            ) && (
               <div tw="flex items-center gap-2 justify-center">
                  <Button
                     type="primary"
                     onClick={() =>
                        byPassTerminalPayment({ type: 'success', cartPayment })
                     }
                  >
                     Mark Success
                  </Button>
                  <Button
                     type="primary"
                     danger
                     onClick={() =>
                        byPassTerminalPayment({ type: 'fail', cartPayment })
                     }
                  >
                     Mark Failure
                  </Button>
               </div>
            )}
         {!isEmpty(cartPayment) &&
            !['SUCCEEDED', 'FAILED', 'CANCELLED', 'QR_GENERATED'].includes(
               cartPayment?.paymentStatus
            ) && (
               <>
                  {countDown && (
                     <Countdown
                        date={countDown}
                        renderer={({ minutes, seconds, completed }) => {
                           if (completed) {
                              return (
                                 <h1 tw="font-extrabold color[rgba(0, 64, 106, 0.9)] text-xl text-center">
                                    {t('Request timed out')}
                                 </h1>
                              )
                           }
                           return (
                              <h1 tw="font-extrabold color[rgba(0, 64, 106, 0.9)] text-xl text-center">
                                 {`Timeout in ${minutes}:${
                                    seconds <= 9 ? '0' : ''
                                 }${seconds}`}
                              </h1>
                           )
                        }}
                        onComplete={() =>
                           cancelTerminalPayment({
                              cartPayment,
                              retryPaymentAttempt: false,
                           })
                        }
                     />
                  )}
               </>
            )}
      </Modal>
   )
}

export default PaymentProcessingModal

const CartPageHeader = ({
   closeModal = () => null,
   resetPaymentProviderStates = () => null,
   isCartPaymentEmpty = true,
}) => {
   const { configOf } = useConfig('brand')
   const PaymentPopUpDesignConfig = useConfig('KioskConfig')
   const isKioskMode = isKiosk()
   
   const {
      ShowBrandName: { value: showBrandName } = {},
      ShowBrandLogo: { value: showBrandLogo } = {},
      brandName: { value: brandName } = {},
      logo: { value: logo } = {},
   } = !isKioskMode
      ? configOf('Brand Info')
      : PaymentPopUpDesignConfig?.KioskConfig?.kioskSettings
   const logoAlignment =
      PaymentPopUpDesignConfig?.KioskConfig?.paymentPopupSettings?.logoAlignment
         ?.value

   const theme = configOf('theme-color', 'Visual')?.themeColor
   const themeColor = theme?.accent?.value
      ? theme?.accent?.value
      : 'rgba(5, 150, 105, 1)'
   return (
      <header
         style={{
            display: 'flex',
            justifyContent: `center`,
         }}
      >
         <div>
            {!isKioskMode && isCartPaymentEmpty && (
               <span
                  tw="hover:(cursor-pointer)"
                  onClick={async () => {
                     const isConfirmed =
                        isClient &&
                        window.confirm(
                           'Your payment will be cancelled,Are you sure you want to go back?'
                        )
                     if (isConfirmed) {
                        await closeModal()
                        await resetPaymentProviderStates()
                     }
                  }}
               >
                  <ArrowLeftIconBG
                     size={40}
                     bgColor="#fff"
                     arrowColor={themeColor}
                  />
               </span>
            )}
            {showBrandLogo && logo && (
               <img src={logo} alt={brandName} tw="height[80px]" />
            )}
         </div>
      </header>
   )
}