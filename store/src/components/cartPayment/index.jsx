import React from 'react'
import { Steps, Form, Input, Button, Radio, Space } from 'antd'
import { useMutation, useSubscription } from '@apollo/react-hooks'
import { useToasts } from 'react-toast-notifications'
import _has from 'lodash/has'
import _isEmpty from 'lodash/isEmpty'

import { Wrapper } from './styles.js'
import * as QUERIES from '../../graphql'
import { Loader } from '../../components'
import { usePayment } from '../../lib'
import { isClient } from '../../utils'

export function CartPaymentComponent({ cartId = null }) {
   const {
      isPaymentLoading,
      paymentLifeCycleState,
      paymentInfo,
      profileInfo,
      setPaymentInfo,
      setProfileInfo,
      updatePaymentState,
   } = usePayment()
   const { addToast } = useToasts()
   const [cart, setCart] = React.useState(null)
   const [loading, setLoading] = React.useState(true)

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
         console.error(error)
         addToast('Something went wrong!', { appearance: 'error' })
      },
   })

   const [updateCart] = useMutation(QUERIES.UPDATE_CART, {
      onCompleted: () => {
         updatePaymentState({
            paymentLifeCycleState: 'PROCESSING',
         })
      },
      onError: error => {
         updatePaymentState({
            paymentLifeCycleState: 'FAILED',
         })
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
      if (value) {
         console.log(value, typeof value)
         const availablePaymentOptionToCart =
            cart.availablePaymentOptionToCart.find(
               option => option.id === value
            )
         console.log(availablePaymentOptionToCart)
         setPaymentInfo({
            selectedAvailablePaymentOption: availablePaymentOptionToCart,
         })
      }
   }

   const confirmPayHandler = () => {
      if (
         !_isEmpty(paymentInfo) &&
         !_isEmpty(paymentInfo.selectedAvailablePaymentOption)
      ) {
         updatePaymentState({
            paymentLifeCycleState: 'INCREMENT_PAYMENT_RETRY_ATTEMPT',
         })
         updateCart({
            variables: {
               id: cartId,
               _inc: { paymentRetryAttempt: 1 },
               _set: {
                  paymentMethodId: null,
                  toUseAvailablePaymentOptionId:
                     paymentInfo?.selectedAvailablePaymentOption?.id,
               },
            },
         })
      } else {
         addToast('Please select payment method', { appearance: 'warning' })
      }
   }

   if (loading || isPaymentLoading) return <Loader inline />
   if (hasCartError) {
      console.error(hasCartError)
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
               {!_isEmpty(cart) &&
                  cart.availablePaymentOptionToCart.map(option => (
                     <Radio value={option?.id} key={option?.id}>
                        {option?.label ||
                           option?.supportedPaymentOption?.paymentOptionLabel}
                     </Radio>
                  ))}
            </Space>
         </Radio.Group>
         <Button
            disabled={paymentLifeCycleState !== 'INITIALIZE'}
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
