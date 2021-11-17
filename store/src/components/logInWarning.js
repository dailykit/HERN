import React from 'react'
import { LoginWrapper } from '../utils'
export const LoginWarning = () => {
   const [showLoginPopup, setShowLoginPopup] = React.useState(true)

   return (
      <LoginWrapper
         closeLoginPopup={() => {
            setShowLoginPopup(false)
         }}
         showLoginPopup={showLoginPopup}
         forceLogin={true}
      />
   )
}
