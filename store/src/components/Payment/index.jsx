import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { Tabs } from 'antd'

import { PlusIcon, Flex, ComboButton } from '@dailykit/ui'
import { useMutation } from '@apollo/client'
import { Wrapper, NewPaymentCard } from './styles'
import {
   Input,
   Button,
   ChevronLeft,
   DeleteIcon,
   VisaIcon,
   MasterCardIcon,
   MaestroIcon,
   AmexIcon,
   PaypalIcon,
   HorizontalTabs,
   HorizontalTab,
   HorizontalTabList,
   HorizontalTabPanel,
   HorizontalTabPanels
} from '../../components'
import { useUser } from '../../Providers'
import { theme } from '../../theme'
import { capitalize, isEmpty, isClient } from '../../utils'
import {
   UPDATE_PLATFORM_CUSTOMER,
   DELETE_STRIPE_PAYMENT_METHOD
} from '../../graphql'
import PaymentForm from '../PaymentForm'

export default function Payment({
   type = 'tunnel',
   onPay,
   isOnPayDisabled = true
}) {
   const [defaultPaymentMethodId, setDefaultPaymentMethodId] = useState('')
   const [intent, setIntent] = useState(null)
   const [contentIndex, setContentIndex] = useState(0)
   const { state } = useUser()
   const { user = {}, isAuthenticated } = state

   const next = () => {
      if (contentIndex === 1) {
         return
      } else {
         setContentIndex(prev => prev + 1)
      }
   }
   const previous = () => {
      if (contentIndex === 0) {
         return
      } else {
         setContentIndex(prev => prev - 1)
      }
   }

   const [updateDefaultPaymentMethodId, { loading: isUpdating }] = useMutation(
      UPDATE_PLATFORM_CUSTOMER,
      {
         refetchQueries: ['CUSTOMER_DETAILS'],
         onCompleted: ({ update_platform_customer = {} }) => {
            const { defaultPaymentMethodId } =
               update_platform_customer?.returning[0]
            setDefaultPaymentMethodId(defaultPaymentMethodId)
         },
         onError: error => {
            console.log(error)
         }
      }
   )
   const [deleteStripePaymentMethod, { loading: isDeleting }] = useMutation(
      DELETE_STRIPE_PAYMENT_METHOD,
      {
         refetchQueries: ['CUSTOMER_DETAILS'],
         onError: error => {
            console.log(error)
         }
      }
   )

   const handleCardClick = paymentMethodId => {
      updateDefaultPaymentMethodId({
         variables: {
            where: {
               keycloakId: {
                  _eq: user?.keycloakId
               }
            },
            _set: {
               defaultPaymentMethodId: paymentMethodId
            }
         }
      })
   }

   const handleDeletePaymentCard = paymentMethodId => {
      if (paymentMethodId !== defaultPaymentMethodId) {
         deleteStripePaymentMethod({
            variables: {
               paymentMethodId: paymentMethodId
            }
         })
      } else {
         alert("Can't Delete the default Payment Method")
      }
   }

   const getSmallContent = paymentMethodId => {
      if (paymentMethodId === defaultPaymentMethodId) {
         return 'Default'
      } else {
         return 'Make it default'
      }
   }

   useEffect(() => {
      if (!isEmpty(user) && !isEmpty(user?.defaultPaymentMethodId)) {
         console.log('ContentIndex,here 0')
         setDefaultPaymentMethodId(user?.defaultPaymentMethodId)
         setContentIndex(0)
      }
      if (!isEmpty(user) && isEmpty(user?.stripePaymentMethods)) {
         console.log('ContentIndex,here 1')
         setContentIndex(1)
      }
   }, [user])

   useEffect(() => {
      if (
         isAuthenticated &&
         isClient &&
         !isEmpty(user) &&
         user?.paymentCustomerId &&
         !intent
      ) {
         ;(async () => {
            const setup_intent = await createSetupIntent(
               user?.paymentCustomerId
            )
            setIntent(setup_intent)
         })()
      }
   }, [user])

   if (type === 'tunnel') {
      return (
         <Wrapper isDeleting={isDeleting}>
            {contentIndex > 0 &&
               !isEmpty(user) &&
               !isEmpty(user?.stripePaymentMethods) && (
                  <span className="ghost sticky-header" onClick={previous}>
                     <ChevronLeft size="18px" color={theme.colors.textColor4} />
                     <span> Select from saved Address</span>
                  </span>
               )}
            {contentIndex === 0 && (
               <>
                  <h3 className="greet-msg">Payment</h3>
                  <div className="sticky-header">
                     <Button className="custom-btn" onClick={next}>
                        <Flex container alignItems="center">
                           <PlusIcon color="#fff" />
                           <span> Add New Payment Method</span>
                        </Flex>
                     </Button>
                  </div>
                  {!isEmpty(user) && !isEmpty(user?.stripePaymentMethods) ? (
                     <div className="grid-view">
                        {user?.stripePaymentMethods?.map(method => {
                           return (
                              <div
                                 key={method?.paymentMethodId}
                                 className="payment-card"
                              >
                                 <label className="checkbox-wrap">
                                    <Input
                                       type="checkbox"
                                       customWidth="24px"
                                       customHeight="24px"
                                       checked={
                                          method?.paymentMethodId ===
                                          defaultPaymentMethodId
                                       }
                                       onChange={() =>
                                          handleCardClick(
                                             method?.paymentMethodId
                                          )
                                       }
                                       disabled={isUpdating}
                                    />

                                    <small>
                                       {getSmallContent(
                                          method?.paymentMethodId
                                       )}
                                    </small>
                                 </label>
                                 <Flex
                                    container
                                    alignItems="flex-start"
                                    flexDirection="column"
                                    justifyContent="space-between"
                                    flex="1"
                                 >
                                    <span className="checkbox-label">
                                       {capitalize(method?.brand || '')}
                                    </span>
                                    <Flex container>
                                       <span className="checkbox-label">
                                          Name :
                                       </span>
                                       <span className="checkbox-label">
                                          {capitalize(
                                             method?.cardHolderName || ''
                                          )}
                                       </span>
                                    </Flex>
                                    <Flex container>
                                       <span className="checkbox-label">
                                          Expiry Date :
                                       </span>
                                       <span className="checkbox-label">
                                          {method?.expMonth}/{method?.expYear}
                                       </span>
                                    </Flex>
                                    <Flex container>
                                       <span className="checkbox-label">
                                          Last 4 digit :
                                       </span>
                                       <span className="checkbox-label">
                                          {method?.last4}
                                       </span>
                                    </Flex>
                                 </Flex>
                                 <span
                                    className="delete-btn"
                                    onClick={() =>
                                       handleDeletePaymentCard(
                                          method?.paymentMethodId
                                       )
                                    }
                                 >
                                    <DeleteIcon
                                       size="16px"
                                       color={theme.colors.textColor3}
                                    />
                                 </span>
                              </div>
                           )
                        })}
                     </div>
                  ) : (
                     <h1 className="empty_address_msg">
                        Looks like you don't have any saved payment card!
                     </h1>
                  )}
               </>
            )}
            {contentIndex === 1 && <PaymentForm intent={intent} />}
         </Wrapper>
      )
   } else {
      return (
         <Wrapper isDeleting={isDeleting} type={type}>
            <div className="payment-div">
               <h3 className="h3_head text8">Pay With</h3>
               <div className="payment-icon-wrapper">
                  <span className="payment-icon">
                     <VisaIcon size="64px" />
                  </span>
                  <span className="payment-icon">
                     <AmexIcon size="64px" />
                  </span>
                  <span className="payment-icon">
                     <MasterCardIcon size="64px" />
                  </span>
                  <span className="payment-icon">
                     <MaestroIcon size="64px" />
                  </span>
               </div>
            </div>
            <div className="card-container">
               <Tabs
                  defaultActiveKey={!isEmpty(user?.paymentMethods) ? '1' : '2'}
                  type="card"
               >
                  <Tabs.TabPane
                     tab="Saved Cards"
                     disabled={isEmpty(user?.paymentMethods)}
                     key="1"
                  >
                     <div className="grid-view">
                        {user?.paymentMethods?.map(method => {
                           return (
                              <NewPaymentCard
                                 key={method?.paymentMethodId}
                                 isDefault={
                                    getSmallContent(method?.paymentMethodId) ===
                                    'Default'
                                 }
                                 onClick={() =>
                                    handleCardClick(method?.paymentMethodId)
                                 }
                              >
                                 <div className="flex-col">
                                    <h2 className="title text9">
                                       Cardholder name
                                    </h2>
                                    <h2 className="value text4">
                                       {capitalize(
                                          method?.cardHolderName || ''
                                       )}
                                    </h2>
                                 </div>
                                 <div className="flex-row">
                                    <div className="card-info">
                                       <h2 className="title text9">
                                          {capitalize(method?.brand || '')}
                                       </h2>
                                       <h2 className="value text4">
                                          ****{method?.last4}
                                       </h2>
                                    </div>
                                    <div className="card-info">
                                       <h2 className="title text9">Expiry</h2>
                                       <h2 className="value text4">
                                          {method?.expMonth}/{method?.expYear}
                                       </h2>
                                    </div>
                                 </div>
                              </NewPaymentCard>
                           )
                        })}
                     </div>
                     <Button
                        className="customButton text3"
                        disabled={isOnPayDisabled}
                        onClick={onPay}
                     >
                        Confirm and pay
                     </Button>
                  </Tabs.TabPane>
                  <Tabs.TabPane tab="Add Card" key="2">
                     <PaymentForm intent={intent} type="checkout" />
                  </Tabs.TabPane>
               </Tabs>
            </div>

            {/* {contentIndex === 1 && <PaymentForm intent={intent} />} */}
         </Wrapper>
      )
   }
}

const createSetupIntent = async customer => {
   try {
      const origin = isClient ? window.location.origin : ''
      const url = `${origin}/server/api/payment/setup-intent` //need to be dynamic later
      const { data } = await axios.post(url, { customer })
      console.log({ setupIntent: data.data })
      return data.data
   } catch (error) {
      return error
   }
}
