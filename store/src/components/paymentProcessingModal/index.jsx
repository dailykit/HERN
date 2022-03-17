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
import { ArrowLeftIconBG } from '../../assets/icons'
import { useWindowSize, isKiosk, formatTerminalStatus } from '../../utils'
import { useTranslation } from '../../context'
import { useConfig } from '../../lib'

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
   console.log('PaymentProcessingModal')
   const router = useRouter()
   const isKioskMode = isKiosk()
   const [isCelebrating, setIsCelebrating] = useState(false)
   const { width, height } = useWindowSize()
   const [countDown, setCountDown] = useState(null)
   const { t } = useTranslation()

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
         if (router.pathname !== `/view-order`) {
            await closeModalHandler()
            setIsProcessingPayment(false)
            setIsPaymentInitiated(false)
            router.push(`/view-order?id=${cartPayment?.cartId}`)
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
            icon = (
               <img
                  src="/assets/gifs/successful.gif"
                  className="payment_status_loader"
               />
            )
            title = 'Successfully placed your order'
            subtitle = t('You will be redirected to your order page shortly')
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
         } else if (
            ![
               'SUCCEEDED',
               'FAILED',
               'CANCELLED',
               'SWIPE_CARD',
               'ENTER_PIN',
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
            icon = (
               <img
                  src="/assets/gifs/successful.gif"
                  className="payment_status_loader"
               />
            )
            title = 'Successfully placed your order'
            subtitle = t('You will be redirected to your booking page shortly')
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
            // start the timeout to cancel the payment if payment is not successful/cancelled/failed
            !['SUCCEEDED', 'FAILED', 'CANCELLED'].includes(
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

   return (
      <Modal
         title={null}
         visible={isOpen}
         footer={null}
         closable={false}
         keyboard={false}
         maskClosable={false}
         centered
         width={isKioskMode ? 780 : 'auto'}
         onCancel={closeModalHandler}
         zIndex={10000}
         bodyStyle={{
            maxHeight: '100%',
            height: isKioskMode ? '100%' : 'calc(100vh - 16px)',
            width: '100%',
            overflowY: 'auto',
         }}
         maskStyle={{
            backgroundColor: isKioskMode ? 'rgba(0, 64, 106, 0.9)' : '#fff',
         }}
      >
         <CartPageHeader />
         {/* this payment option selection screen and back button, it will only show in kiosk app  */}
         {isKioskMode && isEmpty(cartPayment) ? (
            <>
               <Wrapper>
                  <div tw="flex flex-col">
                     <h1 tw="font-extrabold color[rgba(0, 64, 106, 0.9)] text-4xl text-center margin[2rem 0]">
                        {t('Choose a payment method')}
                     </h1>
                     {PaymentOptions.map(option => {
                        return (
                           <>
                              <PayButton
                                 cartId={cartId}
                                 className="hern-kiosk__kiosk-button hern-kiosk__cart-place-order-btn"
                                 key={option.id}
                                 selectedAvailablePaymentOptionId={option.id}
                              >
                                 {t(LABEL[option.label])}
                              </PayButton>

                              <p tw="last:(hidden) font-extrabold margin[2rem 0] color[rgba(0, 64, 106, 0.9)] text-2xl text-center">
                                 {t('OR')}
                              </p>
                           </>
                        )
                     })}
                  </div>
               </Wrapper>
               <Button
                  type="link"
                  tw="fixed top-8 left-4"
                  onClick={resetPaymentProviderStates}
               >
                  <div tw="flex items-center">
                     <ArrowLeftIconBG bgColor="#F7B502" arrowColor="#fff" />
                     <span tw="ml-4 font-bold text-white text-2xl">Back</span>
                  </div>
               </Button>
            </>
         ) : (
            <Wrapper>
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
            ['SUCCEEDED', 'FAILED', 'CANCELLED'].includes(
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
            !['SUCCEEDED', 'FAILED', 'CANCELLED'].includes(
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
                                 {t(
                                    `Timout in ${minutes}:${
                                       seconds <= 9 ? '0' : ''
                                    }${seconds}`
                                 )}
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

const LABEL = {
   COD: 'PAY AT COUNTER',
   TERMINAL: 'PAY VIA CARD',
}

const CartPageHeader = () => {
   const {
      BrandName: { value: showBrandName } = {},
      BrandLogo: { value: showBrandLogo } = {},
      brandName: { value: brandName } = {},
      brandLogo: { value: logo } = {},
   } = useConfig('brand').configOf('Brand Info')
   return (
      <header className="hern-cart-page__header">
         <div className="hern-cart-page__header-logo">
            {showBrandLogo && logo && <img src={logo} alt={brandName} />}
            &nbsp;&nbsp;
            {showBrandName && brandName && <span>{brandName}</span>}
         </div>
      </header>
   )
}
