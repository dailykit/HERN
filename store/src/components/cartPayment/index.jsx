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
import { useUser } from '../../context'
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
   const { user } = useUser()
   const { addToast } = useToasts()
   const [cart, setCart] = React.useState(null)
   const [loading, setLoading] = React.useState(true)
   const [selectCustomerPaymentMethodId, setSelectedCustomerPaymentMethodId] =
      React.useState('')

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

   const [createCustomerPaymentMethod] = useMutation(
      QUERIES.CREATE_CUSTOMER_PAYMENT_METHOD,
      {
         onCompleted: () => {
            updateCart({
               variables: {
                  id: cartId,
                  _inc: { paymentRetryAttempt: 1 },
                  _set: {
                     paymentMethodId: null,
                     toUseAvailablePaymentOptionId:
                        paymentInfo?.selectedAvailablePaymentOption?.id,
                     customerInfo: {
                        customerEmail: profileInfo?.email,
                        customerPhone: profileInfo?.phone,
                        customerLastName: profileInfo?.lastName,
                        customerFirstName: profileInfo?.firstName,
                     },
                  },
               },
            })
         },
         onError: error => {
            console.error(error)
            addToast(' ', { appearance: 'error' })
         },
      }
   )

   const [updatePlatformCustomer] = useMutation(
      QUERIES.UPDATE_PLATFORM_CUSTOMER,
      {
         onCompleted: () => {
            if (selectCustomerPaymentMethodId) {
               createCustomerPaymentMethod({
                  variables: {
                     object: {
                        keycloakId: user.keycloakId,
                        paymentMethodId: selectCustomerPaymentMethodId,
                        supportedPaymentOptionId:
                           paymentInfo.selectedAvailablePaymentOption
                              .supportedPaymentOption.id,
                     },
                  },
               })
            } else {
               updateCart({
                  variables: {
                     id: cartId,
                     _inc: { paymentRetryAttempt: 1 },
                     _set: {
                        paymentMethodId: null,
                        toUseAvailablePaymentOptionId:
                           paymentInfo?.selectedAvailablePaymentOption?.id,
                        customerInfo: {
                           customerEmail: profileInfo?.email,
                           customerPhone: profileInfo?.phone,
                           customerLastName: profileInfo?.lastName,
                           customerFirstName: profileInfo?.firstName,
                        },
                     },
                  },
               })
            }
         },
         onError: error => {
            console.log('updatePlatformCustomer -> error -> ', error)
            addToast('Failed to update the user profile!', {
               appearance: 'success',
            })
         },
      }
   )

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
         !_isEmpty(profileInfo) &&
         !_isEmpty(paymentInfo) &&
         !_isEmpty(paymentInfo.selectedAvailablePaymentOption)
      ) {
         updatePaymentState({
            paymentLifeCycleState: 'INCREMENT_PAYMENT_RETRY_ATTEMPT',
         })
         updatePlatformCustomer({
            variables: {
               keycloakId: user.keycloakId,
               _set: {
                  firstName: profileInfo.firstName,
                  lastName: profileInfo.lastName,
                  phoneNumber: profileInfo.phone,
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
               <Input
                  placeholder="Enter your phone numer"
                  value={selectCustomerPaymentMethodId}
                  onChange={e =>
                     setSelectedCustomerPaymentMethodId(e.target.value)
                  }
               />
            </Form.Item>
         </Form>
         <h1>Select Payment Method</h1>
         <Radio.Group onChange={onPaymentMethodChange}>
            <Space direction="vertical">
               {!_isEmpty(cart) &&
                  cart.availablePaymentOptionToCart.map(option => (
                     <>
                        <Radio value={option?.id} key={option?.id}>
                           {option?.label ||
                              option?.supportedPaymentOption
                                 ?.paymentOptionLabel}
                        </Radio>
                        {paymentInfo?.selectedAvailablePaymentOption?.id ===
                           option?.id &&
                           option?.label !== 'Paytm Page' && (
                              <Input placeholder="Enter your phone numer" />
                           )}
                     </>
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
