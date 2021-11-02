import React, { useState, useEffect } from 'react'
import Confetti from 'react-confetti'
import { useSubscription } from '@apollo/client'
import { useRouter } from 'next/router'
import { Result, Spin } from 'antd'
import { Wrapper } from './styles'
import Modal from '../Modal'
import InlineLoader from '../InlineLoader'
import { ACTIVE_CARTPAYMENT_SUBSCRIPTION } from '../../graphql'
import { useWindowDimensions, isEmpty } from '../../utils'

const PaymentProcessingModal = ({ isOpen, bookingId }) => {
   const router = useRouter()
   const [cartPayment, setCartPayment] = useState(null)
   const [actionUrl, setActionUrl] = useState('')
   const [isCelebrating, setIsCelebrating] = useState(false)
   const [loading, setLoading] = useState(true)
   const { width, height } = useWindowDimensions()
   const { error } = useSubscription(ACTIVE_CARTPAYMENT_SUBSCRIPTION, {
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
         centered
      >
         <Wrapper>
            <Result
               icon={
                  isCelebrating ? (
                     <Result status="success" />
                  ) : (
                     <Spin
                        size="large"
                        wrapperClassName="payment_processing_modal"
                     />
                  )
               }
               title={
                  isCelebrating
                     ? 'Successfully Booked the experience!'
                     : !isEmpty(actionUrl)
                     ? 'Looks like your card requires authentication'
                     : 'Processing your payment'
               }
               subTitle={
                  isCelebrating ? (
                     'You will be redirected to your booking page shortly'
                  ) : !isEmpty(actionUrl) ? (
                     <a
                        href={actionUrl}
                        className="action_url"
                        target="_blank"
                        rel="noreferrer"
                     >
                        Please authenticate your self here
                     </a>
                  ) : (
                     'Please wait while we process your payment'
                  )
               }
            />
            {isCelebrating && <Confetti />}
         </Wrapper>
      </Modal>
   )
}

export default PaymentProcessingModal
