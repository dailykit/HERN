import React from 'react'
import { toast } from 'react-toastify'
import styled from 'styled-components'
import { useParams } from 'react-router'
import { useMutation } from '@apollo/react-hooks'
import {
   Flex,
   Spacer,
   Filler,
   Tunnel,
   Tunnels,
   useTunnel,
   IconButton,
   TextButton,
   OptionTile,
   TunnelHeader,
} from '@dailykit/ui'

import CartInfo from './CartInfo'
import { useManual } from '../../state'
import CartProducts from './CartProducts'
import { MUTATIONS } from '../../../../../graphql'
import { logger } from '../../../../../../../shared/utils'
import { useTabs } from '../../../../../../../shared/providers'
import { RazorpayTunnel, StripeTunnel } from '../../tunnels/Payment'

export const Aside = () => {
   const params = useParams()
   const { cart } = useManual()
   const { addTab } = useTabs()
   const [tunnels, openTunnel, closeTunnel] = useTunnel(1)
   const [update] = useMutation(MUTATIONS.CART.UPDATE, {
      onCompleted: () => {
         closeTunnel(1)
         toast.success('Successfully initialized payment process.')
      },
      onError: error => {
         logger(error)
         toast.error('Failed to initiate payment process.')
      },
   })

   const markPaid = () => {
      if (!params?.id) return
      update({
         variables: {
            id: params.id,
            _set: { paymentStatus: 'SUCCEEDED' },
         },
      })
   }

   return (
      <Styles.Aside>
         <main>
            <CartProducts />
            <Spacer size="8px" xAxis />
            <CartInfo />
         </main>
         <footer>
            {cart?.paymentStatus === 'SUCCEEDED' && cart?.orderId ? (
               <TextButton
                  type="solid"
                  onClick={() =>
                     addTab(
                        `ORD${cart?.orderId}`,
                        `/order/orders/${cart?.orderId}`
                     )
                  }
               >
                  View Order #{cart?.orderId}
               </TextButton>
            ) : (
               <TextButton type="solid" onClick={() => openTunnel(1)}>
                  CHECKOUT
               </TextButton>
            )}
         </footer>
         <Tunnels tunnels={tunnels}>
            <Tunnel size="md">
               <TunnelHeader title="Payment" close={() => closeTunnel(1)} />
               <Flex
                  padding="16px"
                  overflowY="auto"
                  height="calc(100vh - 196px)"
               >
                  <OptionTile
                     title="Via Stripe"
                     onClick={() => openTunnel(2)}
                  />
                  <Spacer size="14px" />
                  <OptionTile
                     title="Via RazorPay"
                     onClick={() => openTunnel(3)}
                  />
                  <Spacer size="14px" />
                  <OptionTile title="Mark Paid" onClick={markPaid} />
               </Flex>
            </Tunnel>

            <Tunnel size="full">
               <TunnelHeader title="Payment" close={() => closeTunnel(2)} />
               <StripeTunnel closeViaTunnel={closeTunnel} />
            </Tunnel>
            <Tunnel size="full">
               <TunnelHeader title="Razorpay" close={() => closeTunnel(3)} />
               <RazorpayTunnel closeViaTunnel={closeTunnel} />
            </Tunnel>
         </Tunnels>
      </Styles.Aside>
   )
}

const Styles = {
   Aside: styled.aside`
      display: flex;
      grid-area: aside;
      background: #f9f9f9;
      flex-direction: column;
      border-left: 1px solid #e3e3e3;
      > main {
         padding: 8px;
         display: flex;
         overflow-y: auto;
         height: calc(100% - 40px);
         > section {
            flex: 1;
         }
      }
      > footer {
         button {
            width: 100%;
            height: 40px;
         }
      }
   `,
}
