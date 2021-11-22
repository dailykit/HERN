import React, { useState } from 'react'
import KioskConfig from './kioskConfig.json'
import { useIdleTimer } from 'react-idle-timer'
import { IdleScreen } from '../../components/kiosk/idleScreen'
// idle screen component
// fulfillment component
// header
// product highlight
// coupons highlights
// product
// modifiers popup

const Kiosk = () => {
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
   if (isIdle) {
      return <IdleScreen config={KioskConfig} />
   }
   return <div>We are in fulfillment page</div>
}
export default Kiosk
