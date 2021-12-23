import React, { useState, useEffect } from 'react'
import KioskConfig from './kioskConfig.json'
import { useMutation } from '@apollo/react-hooks'
import { useIdleTimer } from 'react-idle-timer'
import { Carousel, Layout, Modal } from 'antd'
import isEmpty from 'lodash/isEmpty'
import 'antd/dist/antd.css'

import { IdleScreen } from '../../components/kiosk/idleScreen'
import { KioskHeader } from '../../components/kiosk/header'
import { FulfillmentSection } from '../../components/kiosk/fulfillment'
import { CartContext, useTranslation } from '../../context'
import { useConfig } from '../../lib'
import { combineCartItems, isClient, useQueryParamState } from '../../utils'
import { MenuSection } from '../../components/kiosk/menu'
import { KioskCart } from '../../components/kiosk/cart'
import { DELETE_CART } from '../../graphql'
// idle screen component
// fulfillment component
// header
// product highlight
// coupons highlights
// product
// modifiers popup

const { Header, Content } = Layout
const Kiosk = () => {
   // context
   const { combinedCartItems, setStoredCartId, cartState } =
      React.useContext(CartContext)
   const {
      dispatch,
      currentPage,
      setCurrentPage,
      deleteCurrentPage,
      isIdleScreen,
      setIsIdleScreen,
      clearCurrentPage,
   } = useConfig()

   const { direction } = useTranslation()

   //delete Cart mutation
   const [deleteCart] = useMutation(DELETE_CART, {
      onCompleted: () => {
         clearCurrentPage()
         setStoredCartId(null)
      },
   })

   const handleOnIdle = event => {
      console.log('user is idle', event)
      setIsIdleScreen(true)
      if (!isEmpty(cartState.cart) && cartState.cart.id) {
         deleteCart({
            variables: {
               id: cartState.cart.id,
            },
         })
      }
   }

   const handleOnActive = event => {
      setIsIdleScreen(false)
      console.log('user is active', event)
      console.log('time remaining', getRemainingTime())
   }

   const handleOnAction = event => {
      setIsIdleScreen(false)
      console.log('user did something', event)
   }

   const { getRemainingTime, getLastActiveTime } = useIdleTimer({
      timeout: 1000 * KioskConfig.idlePageSettings.idleTime.value,
      onIdle: handleOnIdle,
      debounce: 500,
      ...(isIdleScreen && {
         onActive: handleOnActive,
         onAction: handleOnAction,
      }),
   })

   console.log('thisIsRemainingTime', getRemainingTime())

   function onChange(a, b, c) {
      console.log(a, b, c)
   }

   useEffect(() => {
      const b = document.querySelector('body')
      b.style.padding = 0
   }, [])

   useIdleTimer({
      timeout:
         1000 *
         (KioskConfig.idlePageSettings.idleTime.value -
            KioskConfig.idlePageSettings.idleScreenWarningTime.value),
      onIdle: warning,
      debounce: 500,
      ...(isIdleScreen && {
         onActive: handleOnActive,
         onAction: handleOnAction,
      }),
   })
   function warning() {
      let secondsToGo = KioskConfig.idlePageSettings.idleScreenWarningTime.value
      const modal = Modal.warning({
         title: `This device is becoming Idle in ${secondsToGo} second TOUCH ANY WHERE...`,
         maskClosable: true,
         centered: true,
      })
      // const timer = setInterval(() => {
      //    secondsToGo -= 1
      // }, 1000)
      setTimeout(() => {
         // clearInterval(timer)
         modal.destroy()
      }, KioskConfig.idlePageSettings.idleScreenWarningTime.value * 1000)
   }
   if (isIdleScreen) {
      return <IdleScreen config={KioskConfig} />
   }
   console.log('this is cureent page', currentPage)
   return (
      <div dir={direction}>
         <Layout>
            {' '}
            <Header
               className="hern-kiosk__kiosk-header"
               style={{
                  backgroundColor: `${KioskConfig.kioskSettings.theme.primaryColor.value}`,
               }}
            >
               <KioskHeader config={KioskConfig} />
            </Header>
            <Layout className="hern-kiosk__content-layout">
               {currentPage === 'fulfillmentPage' && (
                  <Content>
                     <FulfillmentSection
                        config={KioskConfig}
                        setCurrentPage={setCurrentPage}
                     />
                  </Content>
               )}
               {currentPage === 'menuPage' && (
                  <Content>
                     <MenuSection
                        config={KioskConfig}
                        setCurrentPage={setCurrentPage}
                        combinedCartItems={combinedCartItems}
                     />
                  </Content>
               )}
               {currentPage === 'cartPage' && (
                  <Content>
                     <KioskCart
                        config={KioskConfig}
                        setCurrentPage={setCurrentPage}
                        combinedCartItems={combinedCartItems}
                     />
                  </Content>
               )}
            </Layout>
         </Layout>
      </div>
   )
}
export default Kiosk
