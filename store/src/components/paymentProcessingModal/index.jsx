import React, { useState, useEffect } from 'react'
import Confetti from 'react-confetti'
import { useRouter } from 'next/router'
import { Result, Spin, Button, Modal } from 'antd'
import { Wrapper } from './styles'
import { useWindowSize } from '../../utils'

const PaymentProcessingModal = ({
   isOpen,
   status = 'PENDING',
   cartId,
   actionUrl,
   actionRequired,
   closeModal,
   cancelPayment,
}) => {
   console.log('PaymentProcessingModal')
   const router = useRouter()
   const [isCelebrating, setIsCelebrating] = useState(false)
   const { width, height } = useWindowSize()

   const stopCelebration = () => {
      if (router.pathname !== `/placing-order?id=${cartId}`) {
         router.push(`/placing-order?id=${cartId}`)
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
         // <Spin size="large" wrapperClassName="payment_processing_modal" />
         <img
            src="/assets/gifs/paymentProcessing.gif"
            className="payment_status_loader"
         />
      )
      let title = 'Processing your payment'
      let subtitle = 'Please wait while we process your payment'
      let extra = null
      if (status === 'SUCCEEDED') {
         icon = (
            <img
               src="/assets/gifs/successful.gif"
               className="payment_status_loader"
            />
         )
         title = 'Successfully placed your order'
         subtitle = 'You will be redirected to your booking page shortly'
      } else if (status === 'REQUIRES_ACTION') {
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
               href={actionUrl}
               target="_blank"
            >
               Authenticate Here
            </Button>,
            <Button type="link" danger onClick={cancelPayment}>
               Cancel Payment
            </Button>,
         ]
      } else if (status === 'FAILED') {
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
               Try other payment method
            </Button>,
         ]
      } else if (status === 'CANCELLED') {
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
      } else if (status === 'REQUIRES_PAYMENT_METHOD') {
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
      // else if (status === 'PROCESSING' && actionRequired) {
      //    icon = <Result status="info" />
      //    title = 'Complete your payment'
      //    subtitle = 'Please complete your payment in below link'
      //    extra = [
      //       <Button
      //          type="primary"
      //          key="console"
      //          href={actionUrl}
      //          target="_blank"
      //       >
      //          Pay Now
      //       </Button>,
      //       <Button type="primary" key="console" onClick={closeModalHandler}>
      //          Close Modal
      //       </Button>,
      //    ]
      // }

      return {
         icon,
         title,
         subtitle,
         extra,
      }
   }

   // start celebration (confetti effect) once payment is successful
   useEffect(() => {
      if (status === 'SUCCEEDED') {
         startCelebration()
      }
   }, [status])

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
      >
         <Wrapper>
            <Result
               icon={ShowPaymentStatusInfo().icon}
               title={ShowPaymentStatusInfo().title}
               subTitle={ShowPaymentStatusInfo().subtitle}
               extra={ShowPaymentStatusInfo().extra}
            />
            {isCelebrating && <Confetti />}
         </Wrapper>
      </Modal>
   )
}

export default PaymentProcessingModal
