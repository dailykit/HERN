import React from 'react'
import styled from 'styled-components'
import { toast } from 'react-toastify'
import { Flex, Spacer, Text, TunnelHeader } from '@dailykit/ui'
import { useMutation, useQuery, useSubscription } from '@apollo/react-hooks'

import { Wrapper } from './styled'
import { useOrder } from '../../context'
import { logger } from '../../../../shared/utils'
import { InlineLoader } from '../../../../shared/components'
import { CUSTOMER_PAYMENT_METHODS, QUERIES, RETRY_PAYMENT } from '../../graphql'

export const RetryPayment = ({ closeTunnel }) => {
   const { state } = useOrder()
   const [selected, setSelected] = React.useState(null)

   const [retryPayment, { loading: retrying }] = useMutation(RETRY_PAYMENT, {
      onCompleted: () => {
         closeTunnel(2)
         toast.success('Payment reattempt successfull!')
      },
      onError: error => {
         logger(error)
         toast.error('Failed to reattempt payment!')
      },
   })
   const { loading, data: { cart = {} } = {} } = useSubscription(
      QUERIES.CART.ONE,
      {
         skip: !state.cart?.id,
         variables: { id: state.cart?.id },
      }
   )

   const { loading: loadingCustomer, data: { customer = {} } = {} } = useQuery(
      CUSTOMER_PAYMENT_METHODS,
      {
         skip: loading || !cart?.customerKeycloakId,
         variables: { keycloakId: cart?.customerKeycloakId },
      }
   )

   const close = () => {
      closeTunnel(2)
   }

   if (loading || loadingCustomer)
      return (
         <Wrapper>
            <TunnelHeader close={close} title="Manage Payment" />
            <InlineLoader />
         </Wrapper>
      )
   return (
      <Wrapper>
         <TunnelHeader
            close={close}
            title="Retry Payment"
            right={{
               title: 'Retry',
               disabled: !selected,
               isLoading: retrying,
               action: () =>
                  retryPayment({
                     variables: {
                        id: cart?.id,
                        _set: { amount: cart?.totalPrice },
                     },
                  }),
            }}
         />
         <Flex padding="0 16px" overflowY="auto" maxHeight="calc(100% - 104px)">
            <Text as="title">Select a payment method</Text>
            <Spacer size="16px" />
            <ul>
               {Array.isArray(customer?.platform_customer?.payment_methods) &&
                  customer?.platform_customer?.payment_methods.map(method => (
                     <Styles.Card
                        key={method.id}
                        is_active={method.id === selected}
                        onClick={() =>
                           setSelected(existing =>
                              existing === method.id ? null : method.id
                           )
                        }
                     >
                        <Flex
                           container
                           alignItems="center"
                           justifyContent="space-between"
                        >
                           <Text as="h4">Name: {method.name}</Text>
                           <Text as="h4">
                              Expiry: {method.expMonth}/{method.expYear}
                           </Text>
                        </Flex>
                        <Spacer size="16px" />
                        <Text as="h4">Last Digits: {method.last4}</Text>
                     </Styles.Card>
                  ))}
            </ul>
         </Flex>
      </Wrapper>
   )
}

const Styles = {
   Card: styled.li`
      padding: 12px;
      border-radius: 2px;
      list-style: none;
      cursor: pointer;
      border: ${({ is_active }) =>
         is_active ? '2px solid #555b6e' : '1px solid #e7e7e7'};
      + li {
         margin-top: 16px;
      }
   `,
}
