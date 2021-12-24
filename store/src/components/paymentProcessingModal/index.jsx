import tw from 'twin.macro'
import React, { useState, useEffect } from 'react'
import Confetti from 'react-confetti'
import { useRouter } from 'next/router'
import { Result, Spin, Button, Modal } from 'antd'
import { Wrapper } from './styles'
import { Button as StyledButton } from '../button'
import { useWindowSize, isKiosk } from '../../utils'

const PaymentProcessingModal = ({
   isOpen,
   cartPayment,
   codPaymentOptionId,
   closeModal = () => null,
   normalModalClose = () => null,
   cancelPayment = () => null,
   isTestingByPass = false,
   byPassTerminalPayment = () => null,
   cancelTerminalPayment = () => null,
   initializePrinting = () => null,
}) => {
   console.log('PaymentProcessingModal')
   const router = useRouter()
   const isKioskMode = isKiosk()
   const [isCelebrating, setIsCelebrating] = useState(false)
   const { width, height } = useWindowSize()

   const stopCelebration = () => {
      if (isKioskMode) {
         setIsCelebrating(false)
         initializePrinting()
      } else {
         if (router.pathname !== `/placing-order?id=${cartPayment?.cartId}`) {
            router.push(`/placing-order?id=${cartPayment?.cartId}`)
         }
      }
      closeModal()
   }
   const startCelebration = () => {
      setIsCelebrating(true)
      setTimeout(stopCelebration, 5000)
   }

   const closeModalHandler = () => {
      closeModal()
   }

   const ShowPaymentStatusInfo = () => {
      let icon = (
         <img
            src="/assets/gifs/paymentProcessing.gif"
            className="payment_status_loader"
         />
      )

      let title = 'Processing your payment'
      let subtitle = 'Please wait while we process your payment'
      let extra = null
      if (isKioskMode) {
         icon = (
            <img
               src="/assets/gifs/kioskLoader.gif"
               className="payment_status_loader"
            />
         )
         title = 'Processing your order'
         subtitle = 'Please wait while we process your order'
         if (cartPayment?.paymentStatus === 'SUCCEEDED') {
            icon = (
               <img
                  src="/assets/gifs/successful.gif"
                  className="payment_status_loader"
               />
            )
            title = 'Successfully placed your order'
            subtitle = 'You will be redirected to your booking page shortly'
         } else if (cartPayment?.paymentStatus === 'REQUIRES_ACTION') {
            icon = (
               <img
                  src="/assets/gifs/authentication.gif"
                  className="payment_status_loader"
               />
            )
            title = 'Looks like your card requires authentication'
            subtitle =
               'An additional verification step which direct you to an authentication page on your bank’s website'
            extra = [
               <Button
                  type="primary"
                  className="authenticateBtn"
                  href={cartPayment?.actionUrl}
                  target="_blank"
               >
                  Authenticate Here
               </Button>,
               <Button type="link" danger onClick={cancelPayment}>
                  Cancel Payment
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
            subtitle = 'Something went wrong'
            extra = [
               <Button
                  type="primary"
                  className="tryOtherPayment"
                  key="console"
                  onClick={() => {
                     cancelTerminalPayment({
                        cartPayment,
                     })
                  }}
               >
                  Try again
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
            subtitle = 'You cancelled your payment process'
            extra = [
               <Button
                  type="primary"
                  className="tryOtherPayment"
                  key="console"
                  onClick={closeModalHandler}
               >
                  Try other payment method
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
            subtitle =
               "Your payment is failed since your bank doesn't authenticate you"
            extra = [
               <Button
                  type="primary"
                  className="tryOtherPayment"
                  key="console"
                  onClick={closeModalHandler}
               >
                  Try other payment method
               </Button>,
            ]
         } else if (cartPayment?.paymentStatus === 'SWIPE_OR_INSERT') {
            icon = (
               <img
                  src="/assets/gifs/swipe.gif"
                  className="payment_status_loader"
               />
            )
            title = 'Swipe or Insert your card'
            subtitle =
               'Please swipe or insert your card to complete your payment'
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
            subtitle = 'You will be redirected to your booking page shortly'
         } else if (cartPayment?.paymentStatus === 'REQUIRES_ACTION') {
            icon = (
               <img
                  src="/assets/gifs/authentication.gif"
                  className="payment_status_loader"
               />
            )
            title = 'Looks like your card requires authentication'
            subtitle =
               'An additional verification step which direct you to an authentication page on your bank’s website'
            extra = [
               <Button
                  type="primary"
                  className="authenticateBtn"
                  href={cartPayment?.actionUrl}
                  target="_blank"
               >
                  Authenticate Here
               </Button>,
               <Button type="link" danger onClick={cancelPayment}>
                  Cancel Payment
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
            subtitle = 'Something went wrong'
            extra = [
               <Button
                  type="primary"
                  className="tryOtherPayment"
                  key="console"
                  onClick={closeModalHandler}
               >
                  Try again
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
            subtitle = 'You cancelled your payment process'
            extra = [
               <Button
                  type="primary"
                  className="tryOtherPayment"
                  key="console"
                  onClick={closeModalHandler}
               >
                  Try other payment method
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
            subtitle =
               "Your payment is failed since your bank doesn't authenticate you"
            extra = [
               <Button
                  type="primary"
                  className="tryOtherPayment"
                  key="console"
                  onClick={closeModalHandler}
               >
                  Try other payment method
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

   // start celebration (confetti effect) once payment is successful
   useEffect(() => {
      if (cartPayment?.paymentStatus === 'SUCCEEDED') {
         startCelebration()
      }
   }, [cartPayment?.paymentStatus])

   return (
      <Modal
         title={null}
         visible={isOpen}
         footer={null}
         closable={false}
         keyboard={false}
         maskClosable={false}
         centered
         onCancel={closeModalHandler}
         width={780}
         zIndex={10000}
         bodyStyle={{
            maxHeight: '520px',
            overflowY: 'auto',
         }}
         maskStyle={{
            backgroundColor: isKioskMode ? 'rgba(0, 64, 106, 0.9)' : '#fff',
         }}
      >
         <Wrapper>
            <Result
               icon={ShowPaymentStatusInfo().icon}
               title={ShowPaymentStatusInfo().title}
               subTitle={ShowPaymentStatusInfo().subtitle}
               extra={ShowPaymentStatusInfo().extra}
            />

            {isCelebrating === 'success' && <Confetti />}
         </Wrapper>
         {/* <Button type="link" tw="fixed top-4 left-4" onClick={normalModalClose}>
            Close
         </Button> */}
         {cartPayment?.paymentStatus === 'SWIPE_OR_INSERT' && isTestingByPass && (
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

         {isKioskMode &&
            ['PENDING', 'PROCESSING', 'SWIPE_OR_INSERT', 'FAILED'].includes(
               cartPayment?.paymentStatus
            ) && (
               <div tw="fixed bottom-48 width[780px] margin-left[-24px]">
                  <p tw="font-extrabold margin-bottom[36px] text-white text-4xl text-center">
                     OR
                  </p>
                  <StyledButton
                     onClick={() =>
                        cancelTerminalPayment({
                           codPaymentOptionId,
                           cartPayment,
                        })
                     }
                     tw="w-full justify-center"
                     className="hern-kiosk__kiosk-button hern-kiosk__cart-place-order-btn"
                  >
                     PAY AT COUNTER
                  </StyledButton>
               </div>
            )}
      </Modal>
   )
}

export default PaymentProcessingModal
