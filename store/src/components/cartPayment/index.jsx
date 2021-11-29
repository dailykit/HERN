import React from 'react'
import { Steps, Form, Input, Button, Radio, Space } from 'antd'
import { useMutation, useSubscription } from '@apollo/react-hooks'
import { useToasts } from 'react-toast-notifications'

import { Wrapper } from './styles.js'
import * as QUERIES from '../../graphql'
import { Loader } from '../../components'
import { usePayment } from '../../lib'
import { useUser, isAuthenticated } from '../../context'
import {
   isClient,
   formatCurrency,
   getSettings,
   getRoute,
   useRazorPay,
   get_env,
   getRazorpayOptions,
} from '../../utils'

export function CartPaymentComponent({ cartId = null }) {
   const {
      paymentInfo,
      profileInfo,
      setPaymentInfo,
      setProfileInfo,
      isPaymentLoading,
   } = usePayment()
   console.log('profileInfo', profileInfo)
   const { addToast } = useToasts()
   const { displayRazorpay } = useRazorPay()
   const [cart, setCart] = React.useState(null)
   const [loading, setLoading] = React.useState(true)
   const [isDisabled, setIsDisabled] = React.useState(false)
   const [paymentMethods, setPaymentMethods] = React.useState([
      {
         id: 1,
         label: 'Credit/Debit Card',
         method: 'card',
         company: 'stripe',
      },
      {
         id: 2,
         label: 'Net Banking',
         method: 'netbanking',
         company: 'razorpay',
         bank: 'HDFC',
      },
      {
         id: 3,
         label: 'UPI',
         method: 'upi',
         company: 'razorpay',
         vpa: 'abc@ybl',
      },
   ])

   const { error: hasCartError } = useSubscription(QUERIES.CART_SUBSCRIPTION, {
      skip: !isClient || cartId,
      variables: {
         id: cartId,
      },
      onSubscriptionData: ({
         subscriptionData: { data: { cart: requiredCart = {} } = {} } = {},
      } = {}) => {
         setCart(requiredCart)
         setLoading(false)
      },
   })

   const [updateCartPayment] = useMutation(QUERIES.UPDATE_CART_PAYMENT, {
      onError: error => {
         console.log(error)
         addToast('Something went wrong!', { appearance: 'error' })
      },
   })

   const [updateCart] = useMutation(QUERIES.UPDATE_CART, {
      onError: error => {
         addToast(error.message, { appearance: 'error' })
      },
   })

   const onFormValuesChange = (changedValues, allValues) => {
      setProfileInfo({
         ...profileInfo,
         ...changedValues,
      })
   }

   const onPaymentMethodChange = event => {
      const { value } = event.target
      console.log(value)
      setPaymentInfo(value)
   }

   const confirmPayHandler = () => {
      if (paymentInfo) {
         setIsDisabled(true)
         updateCart({
            variables: {
               id: cartId,
               _inc: { paymentRetryAttempt: 1 },
               _set: {
                  paymentMethodId: null,
                  retryPaymentMethod: paymentInfo?.company,
               },
            },
         })
      } else {
         addToast('Please select payment method', { appearance: 'warning' })
      }
   }

   const ondismissHandler = () => {
      console.log('dismissed')
      if (cart && cart?.activeCartPaymentId) {
         updateCartPayment({
            variables: {
               id: cart?.activeCartPaymentId,
               _set: {
                  paymentStatus: 'CANCELLED',
               },
               _inc: {
                  cancelAttempt: 1,
               },
            },
         })
      }
      setIsDisabled(false)
   }

   const eventHandler = response => {
      const responseData = {
         razorpayPaymentId: response.razorpay_payment_id,
         razorpayOrderId: response.razorpay_order_id,
         razorpaySignature: response.razorpay_signature,
      }
      if (response && response?.razorpay_payment_id) {
         console.log('razorpay response', responseData)
         setIsDisabled(false)
      }
   }

   React.useEffect(() => {
      ;(async () => {
         console.log('inside useEffect', cart)
         // right now only handle the razorpay method.
         if (
            cart &&
            cart?.activeCartPaymentId &&
            cart?.activeCartPayment?.transactionRemark
         ) {
            if (cart?.activeCartPayment?.paymentStatus === 'CREATED') {
               const options = getRazorpayOptions({
                  orderDetails: cart?.activeCartPayment?.transactionRemark,
                  paymentInfo,
                  ondismissHandler,
                  eventHandler,
               })
               await displayRazorpay(options)
            }
         }
      })()
   }, [cart?.activeCartPayment])

   if (loading) return <Loader inline />
   if (hasCartError) {
      console.log(hasCartError)
      addToast('Error fetching cart', { appearance: 'error' })
   }

   return (
      <Wrapper>
         <Form
            name="basic"
            labelCol={{ span: 0 }}
            wrapperCol={{ span: 16 }}
            initialValues={profileInfo}
            layout="vertical"
            onFinish={onFinish}
            onFinishFailed={onFinishFailed}
            onValuesChange={onFormValuesChange}
            autoComplete="off"
         >
            <Form.Item
               label="First Name"
               name="firstName"
               rules={[
                  { required: true, message: 'Please input your first name!' },
               ]}
            >
               <Input placeholder="Enter your first name" />
            </Form.Item>
            <Form.Item
               label="Last Name"
               name="lastName"
               rules={[
                  { required: true, message: 'Please input your last name!' },
               ]}
            >
               <Input placeholder="Enter your last name" />
            </Form.Item>
            <Form.Item
               label="Phone No."
               name="phone"
               rules={[
                  {
                     required: true,
                     message: 'Please input your phone number!',
                  },
               ]}
            >
               <Input placeholder="Enter your phone numer" />
            </Form.Item>
         </Form>
         <h1>Select Payment Method</h1>
         <Radio.Group onChange={onPaymentMethodChange}>
            <Space direction="vertical">
               {paymentMethods.map(method => (
                  <Radio value={method}>{method.label}</Radio>
               ))}
            </Space>
         </Radio.Group>
         <Button
            disabled={isDisabled}
            type="primary"
            size="large"
            block
            onClick={confirmPayHandler}
         >
            Confirm & Pay
         </Button>
      </Wrapper>
   )
}
