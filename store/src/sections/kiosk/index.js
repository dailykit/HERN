import React, { useState, useEffect } from 'react'
import KioskConfig from './kioskConfig.json'
import { useMutation } from '@apollo/react-hooks'
import { useIdleTimer } from 'react-idle-timer'
import { Carousel, Layout, Modal } from 'antd'
import isEmpty from 'lodash/isEmpty'

import { IdleScreen } from '../../components/kiosk/idleScreen'
import { KioskHeader } from '../../components/kiosk/header'
import { FulfillmentSection } from '../../components/kiosk/fulfillment'
import { CartContext, useTranslation } from '../../context'
import { useConfig } from '../../lib'
import { combineCartItems, isClient, useQueryParamState } from '../../utils'
import { MenuSection } from '../../components/kiosk/menu'
import { KioskCart } from '../../components/kiosk/cart'
import { DELETE_CART, UPDATE_LOCATION_KIOSK } from '../../graphql'
import { usePayment } from '../../lib'
import { InfoBar } from '../../components/kiosk/component'
import { useKioskMenu } from './utils/useKioskMenu'
import moment from 'moment'
// idle screen component
// fulfillment component
// header
// product highlight
// coupons highlights
// product
// modifiers popup

const { Header, Content } = Layout
const Kiosk = props => {
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
      kioskId,
   } = useConfig()
   const { kioskConfig } = props
   // console.log('kioskConfig', kioskConfig)

   const { direction } = useTranslation()
   const collectionIds = React.useMemo(() => {
      return kioskConfig.data.collectionData.value.length > 0
         ? kioskConfig.data.collectionData.value.map(
              collection => collection.id
           )
         : []
   }, [kioskConfig])
   const { status: kioskMenuStatus, hydratedMenu } = useKioskMenu(collectionIds)

   const { resetPaymentProviderStates } = usePayment()
   console.log('hydratedMenu', hydratedMenu)
   //delete Cart mutation
   const [deleteCart] = useMutation(DELETE_CART)

   const handleOnIdle = event => {
      console.log('user is idle', event)
      setIsIdleScreen(true)
      // if (!isEmpty(cartState.cart) && cartState.cart.id) {
      //    deleteCart({
      //       variables: {
      //          id: cartState.cart.id,
      //       },
      //    })
      //    clearCurrentPage()
      //    setStoredCartId(null)
      //    resetPaymentProviderStates()
      // } else {
      //    clearCurrentPage()
      //    setStoredCartId(null)
      //    resetPaymentProviderStates()
      // }
   }
   const resetStates = () => {
      if (!isEmpty(cartState.cart) && cartState.cart.id) {
         deleteCart({
            variables: {
               id: cartState.cart.id,
            },
         })
         clearCurrentPage()
         setStoredCartId(null)
         resetPaymentProviderStates()
      } else {
         clearCurrentPage()
         setStoredCartId(null)
         resetPaymentProviderStates()
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
      timeout: 1000 * kioskConfig.idlePageSettings.idleTime.value,
      onIdle: handleOnIdle,
      debounce: 500,
      ...(isIdleScreen && {
         onActive: handleOnActive,
         onAction: handleOnAction,
      }),
   })

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
         (kioskConfig.idlePageSettings.idleTime.value -
            kioskConfig.idlePageSettings.idleScreenWarningTime.value),
      onIdle: warning,
      debounce: 500,
      ...(isIdleScreen && {
         onActive: handleOnActive,
         onAction: handleOnAction,
      }),
   })
   function warning() {
      let secondsToGo = kioskConfig.idlePageSettings.idleScreenWarningTime.value
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
      }, kioskConfig.idlePageSettings.idleScreenWarningTime.value * 1000)
   }
   const [updateLocationKiosk] = useMutation(UPDATE_LOCATION_KIOSK)
   const updateKioskLastActiveTime = () => {
      updateLocationKiosk({
         variables: {
            where: {
               id: {
                  _eq: kioskId,
               },
            },
            _set: {
               lastActiveTime: new Date().toISOString(),
            },
         },
      })
   }
   React.useEffect(() => {
      updateKioskLastActiveTime()
      setInterval(() => {
         updateKioskLastActiveTime()
      }, 60000)
   }, [])
   if (isIdleScreen) {
      return <IdleScreen config={kioskConfig} resetStates={resetStates} />
   }

   return (
      <div dir={direction}>
         <Layout>
            {' '}
            <Header
               className="hern-kiosk__kiosk-header"
               style={{
                  backgroundColor: `${kioskConfig.kioskSettings.theme.primaryColor.value}`,
               }}
            >
               <KioskHeader config={kioskConfig} />
            </Header>
            <Layout className="hern-kiosk__content-layout">
               <InfoBar
                  backgroundColor={
                     kioskConfig?.infoBar?.storeNotAvailable?.backgroundColor
                        ?.value || '#fc4f4f'
                  }
                  message={
                     kioskConfig?.infoBar?.storeNotAvailable?.text?.value ||
                     'Not accepting orders right now. Feel free to browse the menu.'
                  }
               />
               {currentPage === 'fulfillmentPage' && (
                  <Content>
                     <FulfillmentSection
                        config={kioskConfig}
                        setCurrentPage={setCurrentPage}
                     />
                  </Content>
               )}
               {currentPage === 'menuPage' && (
                  <Content>
                     <MenuSection
                        config={kioskConfig}
                        setCurrentPage={setCurrentPage}
                        combinedCartItems={combinedCartItems}
                        hydratedMenu={hydratedMenu}
                        status={kioskMenuStatus}
                     />
                  </Content>
               )}
               {currentPage === 'cartPage' && (
                  <Content>
                     <KioskCart
                        config={kioskConfig}
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
