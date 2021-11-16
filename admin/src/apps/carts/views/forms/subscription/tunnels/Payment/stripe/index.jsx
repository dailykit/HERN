import React from 'react'
import { toast } from 'react-toastify'
import styled from 'styled-components'
import { useParams } from 'react-router'
import { useQuery, useMutation } from '@apollo/react-hooks'
import {
   Text,
   Flex,
   Filler,
   Spacer,
   Tunnel,
   Tunnels,
   TextButton,
   useTunnel,
   IconButton,
} from '@dailykit/ui'

import { useManual } from '../../../state'
import PaymentTunnel from './PaymentTunnel'
import { QUERIES, MUTATIONS } from '../../../../../../graphql'
import EmptyIllo from '../../../../../../assets/svgs/EmptyIllo'
import { logger } from '../../../../../../../../shared/utils'
import * as Icon from '../../../../../../../../shared/assets/icons'

export const StripeTunnel = ({ closeViaTunnel }) => {
   const params = useParams()
   const { brand, customer } = useManual()
   const [card, setCard] = React.useState()
   const [tunnels, openTunnel, closeTunnel] = useTunnel()

   const { data: { settings = [] } = {} } = useQuery(QUERIES.BRAND.SETTINGS, {
      skip: !brand?.id,
      variables: {
         brandId: brand?.id,
         identifier: { _eq: 'Contact' },
         type: { _eq: 'brand' },
      },
   })
   const [update] = useMutation(MUTATIONS.CART.UPDATE, {
      onCompleted: () => {
         closeViaTunnel(1)
         toast.success('Successfully initialized payment process.')
      },
      onError: error => {
         logger(error)
         toast.error('Failed to initiate payment process.')
      },
   })

   const handlePayment = () => {
      if (!params?.id) return
      update({
         variables: {
            id: params.id,
            _set: { paymentMethodId: card?.id },
            _inc: { paymentRetryAttempt: 1 },
         },
      })
   }

   return (
      <>
         <Flex padding="16px" overflowY="auto" height="calc(100vh - 196px)">
            {settings.length > 0 && (
               <>
                  <Flex container alignItems="center">
                     <Text as="title">Checkout url: </Text>
                     <a
                        href={`${settings[0]?.value?.website}/get-started/checkout/?id=${params.id}`}
                     >{`${settings[0]?.value?.website}/get-started/checkout/?id=${params.id}`}</a>
                  </Flex>
                  <Spacer size="16px" />
               </>
            )}
            <Styles.Card>
               <Header
                  title="Payment Details"
                  onEdit={() => {
                     if (!customer?.id) {
                        return toast.warning('Please select a customer first.')
                     }
                     openTunnel(1)
                  }}
               />
               <Flex as="main" padding="0 8px 8px 8px">
                  {card?.id && card?.last4 ? (
                     <div>
                        <Text as="p">Name: {card?.name}</Text>
                        <Text as="p">
                           Expiry: {card?.expMonth}/{card?.expYear}
                        </Text>
                        <Text as="p">Last 4: {card?.last4}</Text>
                     </div>
                  ) : (
                     <Styles.Filler
                        height="100px"
                        message="Please select a payment method"
                        illustration={<EmptyIllo width="120px" />}
                     />
                  )}
               </Flex>
            </Styles.Card>
            <Spacer size="16px" />
            <TextButton
               size="sm"
               type="solid"
               disabled={!card?.id}
               onClick={handlePayment}
            >
               Pay
            </TextButton>
         </Flex>
         <Tunnels tunnels={tunnels}>
            <Tunnel size="sm">
               <PaymentTunnel closeTunnel={closeTunnel} setCard={setCard} />
            </Tunnel>
         </Tunnels>
      </>
   )
}

const Header = ({ title = '', onEdit = null }) => {
   return (
      <Flex
         container
         as="header"
         height="36px"
         padding="0 8px"
         alignItems="center"
         justifyContent="space-between"
      >
         <Text as="text2">{title}</Text>
         {onEdit && (
            <IconButton type="ghost" size="sm" onClick={onEdit}>
               <Icon.EditIcon size="12px" />
            </IconButton>
         )}
      </Flex>
   )
}

const Styles = {
   Card: styled.div`
      border-radius: 2px;
      background: #ffffff;
      box-shadow: 0 2px 40px 2px rgb(222 218 218);
      > header {
         button {
            width: 28px;
            height: 28px;
         }
      }
   `,
   Filler: styled(Filler)`
      p {
         font-size: 14px;
         text-align: center;
      }
   `,
}
