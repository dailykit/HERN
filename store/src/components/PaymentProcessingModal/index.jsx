import React, { useState, useEffect } from 'react'
import Confetti from 'react-confetti'
import { useSubscription } from '@apollo/client'
import { useRouter } from 'next/router'
import { Result, Spin, Button } from 'antd'
import { Wrapper } from './styles'
import Modal from '../Modal'
import InlineLoader from '../InlineLoader'
import { ACTIVE_CARTPAYMENT_SUBSCRIPTION } from '../../graphql'
import { useWindowDimensions, isEmpty } from '../../utils'

const PaymentProcessingModal = ({ isOpen, bookingId, closeModal }) => {
   const router = useRouter()
   const [cartPayment, setCartPayment] = useState(null)
   const [actionUrl, setActionUrl] = useState('')
   const [isCelebrating, setIsCelebrating] = useState(false)
   const [loading, setLoading] = useState(true)
   const { width, height } = useWindowDimensions()
   const { error } = useSubscription(ACTIVE_CARTPAYMENT_SUBSCRIPTION, {
      skip: !isOpen,
      variables: {
         where: {
            experienceBooking: {
               id: {
                  _eq: bookingId
               }
            }
         }
      },
      onSubscriptionData: async ({
         subscriptionData: { data: { carts = [] } = {} } = {}
      } = {}) => {
         const [cart] = carts
         if (!isEmpty(carts)) {
            if (!isEmpty(cart?.activeCartPayment)) {
               setCartPayment(cart?.activeCartPayment)
            }
         }

         setLoading(false)
      }
   })

   const stopCelebration = () => {
      router.push(`/dashboard/myBookings/${bookingId}`)
   }
   const startCelebration = () => {
      setIsCelebrating(true)
      setTimeout(stopCelebration, 5000)
   }

   const ShowPaymentStatusInfo = () => {
      let icon = (
         <Spin size="large" wrapperClassName="payment_processing_modal" />
      )
      let title = 'Processing your payment'
      let subtitle = 'Please wait while we process your payment'
      let extra = null
      if (cartPayment?.paymentStatus === 'SUCCEEDED') {
         icon = <Result status="success" />
         title = 'Successfully Booked the experience!'
         subtitle = 'You will be redirected to your booking page shortly'
      } else if (cartPayment?.paymentStatus === 'REQUIRES_ACTION') {
         icon = <Result status="info" />
         title = 'Looks like your card requires authentication'
         subtitle =
            'An additional verification step which direct you to an authentication page on your bank’s website'
         extra = [
            <Button
               type="primary"
               key="console"
               href={actionUrl}
               target="_blank"
            >
               Authenticate Here
            </Button>
         ]
      } else if (cartPayment?.paymentStatus === 'PAYMENT_FAILED') {
         icon = <Result status="error" />
         title = 'Payment Failed'
         subtitle = 'Something went wrong'
         extra = [
            <Button type="primary" key="console" onClick={closeModal}>
               Close Modal
            </Button>
         ]
      } else if (cartPayment?.paymentStatus === 'REQUIRES_PAYMENT_METHOD') {
         icon = <Result status="error" />
         title = 'Payment Failed'
         subtitle =
            "Your payment is failed since your bank doesn't authenticate you"
         extra = [
            <Button type="primary" key="console" onClick={closeModal}>
               Close Modal
            </Button>
         ]
      }

      return {
         icon,
         title,
         subtitle,
         extra
      }
   }

   useEffect(() => {
      if (cartPayment?.paymentStatus === 'SUCCEEDED') {
         console.log('initiating celebration')
         startCelebration()
      } else if (cartPayment?.paymentStatus === 'REQUIRES_ACTION') {
         if (
            cartPayment?.transactionRemark &&
            Object.keys(cartPayment?.transactionRemark).length > 0 &&
            cartPayment?.transactionRemark.next_action
         ) {
            if (
               cartPayment?.transactionRemark.next_action.type ===
               'use_stripe_sdk'
            ) {
               setActionUrl(
                  cartPayment?.transactionRemark.next_action.use_stripe_sdk
                     .stripe_js
               )
            } else {
               setActionUrl(
                  cartPayment?.transactionRemark.next_action.redirect_to_url.url
               )
            }
         }
      } else if (cartPayment?.paymentStatus === 'PAYMENT_FAILED') {
         setActionUrl('')
      } else if (cartPayment?.paymentStatus === 'REQUIRES_PAYMENT_METHOD') {
         setActionUrl('')
      }
   }, [cartPayment])

   if (loading) return <InlineLoader />
   if (error)
      return (
         <Result status="error" title="Error" subTitle="Something went wrong" />
      )
   return (
      <Modal
         title="Payment Processing"
         isOpen={isOpen}
         footer={null}
         closable={false}
         keyboard={false}
         centered
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
