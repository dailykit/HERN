import React from 'react'
import moment from 'moment'
import { isEmpty } from 'lodash'
import { useRouter } from 'next/router'
import tw, { styled, css } from 'twin.macro'
import { useSubscription } from '@apollo/react-hooks'

import { useConfig } from '../../lib'
import { isClient, get_env } from '../../utils'
import { useUser } from '../../context'
import { CART_STATUS } from '../../graphql'
import OrderInfo from '../../sections/OrderInfo'
import { Loader, HelperBar } from '../../components'
import { PlacedOrderIllo, CartIllo, PaymentIllo } from '../../assets/icons'

const ReactPixel = isClient ? require('react-facebook-pixel').default : null

export const PlacingOrder = () => {
   return (
      <Wrapper>
         <Main tw="pt-4">
            <ContentWrapper />
         </Main>
      </Wrapper>
   )
}

const ContentWrapper = () => {
   const { user } = useUser()
   const { configOf } = useConfig()
   const { pathname } = useRouter()
   const {
      error,
      loading,
      data: { cart = {} } = {},
   } = useSubscription(CART_STATUS, {
      skip: !isClient || !new URLSearchParams(location.search).get('id'),
      variables: {
         id: isClient ? new URLSearchParams(location.search).get('id') : '',
      },
      onSubscriptionData: ({
         subscriptionData: { data: { cart = {} } = {} } = {},
      } = {}) => {
         const isNotFirstTimeOrder = pathname === '/[brand]/placing-order'
         if (isNotFirstTimeOrder) {
            ReactPixel.trackCustom('earlyPay', {
               ...cart,
               currency: isClient && get_env('CURRENCY'),
               value: cart?.amount,
            })
         } else {
            ReactPixel.track('Subscribe', {
               ...cart,
               currency: isClient && get_env('CURRENCY'),
            })
         }

         ReactPixel.track('Purchase', {
            ...cart,
            currency: isClient && get_env('CURRENCY'),
            value: cart?.amount,
         })
      },
   })
   const theme = configOf('theme-color', 'Visual')
   const gotoMenu = () => {
      isClient && window.localStorage.removeItem('plan')
      if (isClient) {
         window.location.href = cart?.fulfillmentInfo?.slot?.from
            ? `${window.location.origin}/menu?d=${moment(
                 cart?.fulfillmentInfo?.slot?.from
              ).format('YYYY-MM-DD')}`
            : `${window.location.origin}/menu`
      }
   }

   if (loading) return <Loader inline />
   if (isClient && !new URLSearchParams(location.search).get('id')) {
      return (
         <Main>
            <div tw="p-4 w-full">
               <HelperBar>
                  <HelperBar.Title>
                     Oh no! Looks like you've wandered on an unknown path, let's
                     get you to home.
                  </HelperBar.Title>
                  <HelperBar.Button onClick={() => navigate('/')}>
                     Go to Home
                  </HelperBar.Button>
               </HelperBar>
            </div>
         </Main>
      )
   }
   if (error) {
      return (
         <Main>
            <div tw="p-4 w-full">
               <HelperBar type="danger">
                  <HelperBar.SubTitle>
                     Looks like there was an issue fetching details, please
                     refresh the page!
                  </HelperBar.SubTitle>
               </HelperBar>
            </div>
         </Main>
      )
   }
   if (isEmpty(cart)) {
      return (
         <Main>
            <div tw="p-4 w-full">
               <HelperBar type="info">
                  <HelperBar.Title>
                     Looks like the page you're requesting is not available
                     anymore, let's get you to home.
                  </HelperBar.Title>
                  <HelperBar.Button onClick={() => navigate('/')}>
                     Go to Home
                  </HelperBar.Button>
               </HelperBar>
            </div>
         </Main>
      )
   }
   if (user?.keycloakId !== cart?.customerKeycloakId) {
      return (
         <Main>
            <div tw="p-4 w-full">
               <HelperBar type="warning">
                  <HelperBar.SubTitle>
                     Seems like, you do not have access to this page, let's get
                     you to home.
                  </HelperBar.SubTitle>
                  <HelperBar.Button onClick={() => navigate('/')}>
                     Go to Home
                  </HelperBar.Button>
               </HelperBar>
            </div>
         </Main>
      )
   }
   return (
      <Content>
         <header tw="w-full my-3 pb-1 border-b flex items-center justify-between">
            <SectionTitle theme={theme}>Order Summary</SectionTitle>
         </header>
         <OrderInfo cart={cart} />
         <Steps>
            <Step
               className={`${cart.status !== 'CART_PENDING' ? 'active' : ''}`}
            >
               <span tw="border rounded-full mb-3 shadow-md">
                  <CartIllo />
               </span>
               Saving Cart
               {cart.status === 'CART_PENDING' && <Pulse />}
            </Step>
            <Step
               className={`${
                  cart.paymentStatus === 'SUCCEEDED' ? 'active' : ''
               }`}
            >
               <span tw="border rounded-full mb-3 shadow-md">
                  <PaymentIllo />
               </span>
               Processing Payment
               {cart.paymentStatus !== 'SUCCEEDED' && <Pulse />}
            </Step>
            <Step
               className={`${
                  cart.status === 'ORDER_PENDING' && cart.orderId
                     ? 'active'
                     : 'null'
               }`}
            >
               <span tw="border rounded-full mb-3 shadow-md">
                  <PlacedOrderIllo />
               </span>
               Order Placed
               {cart.status !== 'ORDER_PENDING' ||
                  (!Boolean(cart.orderId) && <Pulse />)}
            </Step>
         </Steps>
         {cart.status === 'ORDER_PENDING' && cart.orderId && (
            <HelperBar type="success" tw="mt-3">
               <HelperBar.Title>
                  <span role="img" aria-label="celebrate">
                     🎉
                  </span>
                  Congratulations!{' '}
               </HelperBar.Title>
               <HelperBar.SubTitle>
                  Your order has been placed. Continue selecting menu for others
                  weeks.
               </HelperBar.SubTitle>
               <HelperBar.Button onClick={gotoMenu}>
                  Browse Menu
               </HelperBar.Button>
            </HelperBar>
         )}
      </Content>
   )
}

const Pulse = () => (
   <span tw="mt-3 flex h-3 w-3 relative">
      <span tw="animate-ping absolute inline-flex h-full w-full rounded-full bg-gray-400 opacity-75"></span>
      <span tw="relative inline-flex rounded-full h-3 w-3 bg-gray-500"></span>
   </span>
)

const Wrapper = styled.div`
   ${tw`md:bg-gray-100`}
`

const SectionTitle = styled.h3(
   ({ theme }) => css`
      ${tw`text-green-600 text-lg`}
      ${theme?.accent && `color: ${theme.accent}`}
   `
)

const Main = styled.main`
   margin: auto;
   max-width: 980px;
   background: #fff;
   padding-bottom: 24px;
   min-height: calc(100vh - 128px);
`

const Content = styled.section`
   margin: auto;
   max-width: 567px;
   width: calc(100% - 40px);
   ${tw`flex flex-col items-center`}
`

const Steps = styled.ul`
   ${tw`w-full flex items-start justify-between`}
`

const Step = styled.li`
   ${tw`flex flex-col items-center justify-center text-gray-600`}
   &.active {
      ${tw`text-green-600`}
   }
`
