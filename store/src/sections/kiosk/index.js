import React, { useState, useEffect } from 'react'
import KioskConfig from './kioskConfig.json'
import { useIdleTimer } from 'react-idle-timer'
import { IdleScreen } from '../../components/kiosk/idleScreen'
import 'antd/dist/antd.css'
import { Carousel, Layout } from 'antd'
import { KioskHeader } from '../../components/kiosk/header'
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
   useEffect(() => {
      const b = document.querySelector('body')
      b.style.padding = 0
   }, [])
   if (isIdle) {
      return <IdleScreen config={KioskConfig} />
   }
   return (
      <div>
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
            <Layout>
               <Carousel afterChange={onChange} ref={componentsTabRef}>
                  <Content>This is fulfillment selection page</Content>
                  <Content>Menu</Content>
               </Carousel>
               <button
                  onClick={() => {
                     componentsTabRef.current.next()
                  }}
               >
                  next
               </button>
               <button
                  onClick={() => {
                     componentsTabRef.current.prev()
                  }}
               >
                  last
               </button>
            </Layout>
         </Layout>
      </div>
   )
}
export default Kiosk
