import React, { useState, useEffect } from 'react'
import KioskConfig from './kioskConfig.json'
import { useIdleTimer } from 'react-idle-timer'
import { IdleScreen } from '../../components/kiosk/idleScreen'
import 'antd/dist/antd.css'
import { Carousel, Layout } from 'antd'
import { KioskHeader } from '../../components/kiosk/header'
import { FulfillmentSection } from '../../components/kiosk/fulfillment'
import { useTranslation } from '../../context'
import { useConfig } from '../../lib'
import { isClient, useQueryParamState } from '../../utils'
import { MenuSection } from '../../components/kiosk/menu'
// idle screen component
// fulfillment component
// header
// product highlight
// coupons highlights
// product
// modifiers popup

const { Header, Content } = Layout
const Kiosk = () => {
   const componentsTabRef = React.useRef()
   const { direction } = useTranslation()

   const [isIdle, setIsIdle] = useState(false)

   const handleOnIdle = event => {
      console.log('user is idle', event)
      setIsIdle(true)
      deleteCurrentPage('currentPage')
      // productCategoryId
      // Replace current querystring with the new one
      const search = isClient ? window.location.search : ''
      let queryParams = new URLSearchParams(search)
      queryParams.delete('productCategoryId')
      history.replaceState(null, null, '?' + queryParams.toString())
      console.log('last active', getLastActiveTime())
   }

   const handleOnActive = event => {
      setIsIdle(false)
      console.log('user is active', event)
      console.log('time remaining', getRemainingTime())
   }

   const handleOnAction = event => {
      console.log('user did something', event)
   }

   const { getRemainingTime, getLastActiveTime } = useIdleTimer({
      timeout: 1000 * KioskConfig.idlePageSettings.idleTime.value,
      onIdle: handleOnIdle,
      debounce: 500,
      ...(isIdle && { onActive: handleOnActive, onAction: handleOnAction }),
   })

   function onChange(a, b, c) {
      console.log(a, b, c)
   }

   useEffect(() => {
      const b = document.querySelector('body')
      b.style.padding = 0
   }, [])
   const [currentPage, setCurrentPage, deleteCurrentPage] = useQueryParamState(
      'currentPage',
      'fulfillmentPage'
   )
   if (isIdle) {
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
                     />
                  </Content>
               )}
            </Layout>
         </Layout>
      </div>
   )
}
export default Kiosk
