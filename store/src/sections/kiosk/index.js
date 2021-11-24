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
   const contentStyle = {
      height: '160px',
      color: '#fff',
      lineHeight: '160px',
      textAlign: 'center',
      background: '#364d79',
   }
   function onChange(a, b, c) {
      console.log(a, b, c)
   }

   // for go to next carousal
   const goNext = () => {
      componentsTabRef.current.next()
   }
   // for go to last carousal
   const goLast = () => {
      componentsTabRef.current.prev()
   }
   useEffect(() => {
      const b = document.querySelector('body')
      b.style.padding = 0
   }, [])
   if (isIdle) {
      return <IdleScreen config={KioskConfig} />
   }
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
               <Carousel afterChange={onChange} ref={componentsTabRef}>
                  <Content>
                     <FulfillmentSection config={KioskConfig} goNext={goNext} />
                  </Content>
                  <Content>Menu</Content>
               </Carousel>
            </Layout>
         </Layout>
      </div>
   )
}
export default Kiosk
