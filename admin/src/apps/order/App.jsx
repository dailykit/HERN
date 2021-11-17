import React from 'react'
import { Tunnels, Tunnel, useTunnel } from '@dailykit/ui'

// Context
import { useOrder, useConfig } from './context'

import Main from './sections/Main'
import Footer from './sections/Footer'

// Styled
import { StyledWrapper, StyledTunnel, OrderSummaryTunnel } from './styled'
import {
   OrderSummary,
   FilterTunnel,
   ConfigTunnel,
   ProcessSachet,
   DeliveryConfig,
   Notifications,
   ManagePayment,
   RetryPayment,
   ProcessProduct,
} from './components'

import { ErrorBoundary } from '../../shared/components'
import { useAccess, useTabs } from '../../shared/providers'
import BottomQuickInfoBar from './components/BottomQuickInfoBar'

const App = () => {
   const { isSuperUser } = useAccess()
   const { state, dispatch } = useOrder()
   const { state: configState } = useConfig()
   const [tunnels, openTunnel, closeTunnel] = useTunnel(1)
   const [
      orderSummaryTunnels,
      openOrderSummaryTunnel,
      closeOrderSummaryTunnel,
   ] = useTunnel(1)
   const [filterTunnels, openFilterTunnel, closeFilterTunnel] = useTunnel(1)
   const [configTunnels, openConfigTunnel, closeConfigTunnel] = useTunnel(1)
   const [notifTunnels, openNotifTunnel, closeNotifTunnel] = useTunnel(1)
   const [paymentTunnels, openPaymentTunnel, closePaymentTunnel] = useTunnel(2)
   const [position, setPosition] = React.useState('left')

   React.useEffect(() => {
      if (!isSuperUser && configState.current_station?.id) {
         dispatch({
            type: 'SET_FILTER',
            payload: {
               cart: {
                  ...state.orders?.where?.cart,
                  cartItems: {
                     ...(state.orders?.where?.cart?.cartItems || {}),
                     productOption: {
                        operationConfig: {
                           stationId: {
                              _eq: configState.current_station?.id,
                           },
                        },
                     },
                  },
               },
            },
         })
      }
   }, [configState.current_station.id])

   React.useEffect(() => {
      if (state.delivery_config.orderId) {
         openTunnel(1)
      }
   }, [state.delivery_config])

   React.useEffect(() => {
      if (state.cart?.id) {
         openPaymentTunnel(1)
      }
   }, [state.cart.id])

   React.useEffect(() => {
      if (configState.tunnel.visible) {
         openConfigTunnel(1)
      } else {
         closeConfigTunnel(1)
      }
   }, [configState.tunnel.visible])

   React.useEffect(() => {
      if (state.filter.tunnel) {
         openFilterTunnel(1)
      } else {
         closeFilterTunnel(1)
      }
   }, [state.filter.tunnel])

   return (
      <StyledWrapper position={position}>
         <ErrorBoundary rootRoute="/apps/order">
            {state.current_view === 'SUMMARY' && <OrderSummary />}
            {state.current_view === 'SACHET_ITEM' && <ProcessSachet />}
            {state.current_view === 'PRODUCT' && <ProcessProduct />}
         </ErrorBoundary>
         <Main />
         <Footer openTunnel={openNotifTunnel} setPosition={setPosition} />
         <BottomQuickInfoBar openOrderSummaryTunnel={openOrderSummaryTunnel} />
         <ErrorBoundary>
            <Tunnels mt={0} tunnels={orderSummaryTunnels}>
               <StyledTunnel layer="1" size="md">
                  <OrderSummaryTunnel>
                     {state.current_view === 'SUMMARY' && (
                        <OrderSummary
                           closeOrderSummaryTunnel={closeOrderSummaryTunnel}
                        />
                     )}
                     {state.current_view === 'SACHET_ITEM' && (
                        <ProcessSachet
                           closeOrderSummaryTunnel={closeOrderSummaryTunnel}
                        />
                     )}
                  </OrderSummaryTunnel>
               </StyledTunnel>
            </Tunnels>
            <Notifications
               tunnels={notifTunnels}
               closeTunnel={closeNotifTunnel}
            />
            <Tunnels tunnels={tunnels}>
               <Tunnel layer="1" size="md">
                  <DeliveryConfig closeTunnel={closeTunnel} />
               </Tunnel>
            </Tunnels>
            <Tunnels tunnels={filterTunnels}>
               <Tunnel layer="1" size="sm">
                  <FilterTunnel />
               </Tunnel>
            </Tunnels>
            <Tunnels tunnels={configTunnels}>
               <Tunnel layer="1" size="full">
                  <ConfigTunnel />
               </Tunnel>
            </Tunnels>
            <Tunnels tunnels={paymentTunnels}>
               <Tunnel layer="1" size="md">
                  <ManagePayment
                     openTunnel={openPaymentTunnel}
                     closeTunnel={closePaymentTunnel}
                  />
               </Tunnel>
               <Tunnel layer="2" size="md">
                  <RetryPayment closeTunnel={closePaymentTunnel} />
               </Tunnel>
            </Tunnels>
         </ErrorBoundary>
      </StyledWrapper>
   )
}

export default App
