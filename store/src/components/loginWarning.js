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

export const LoginWarningWithText = ({ text = 'You need to login.' }) => {
   const [showLoginPopup, setShowLoginPopup] = React.useState(false)
   return (
      <>
         <div>
            {text}{' '}
            <span
               onClick={() => {
                  setShowLoginPopup(true)
               }}
               style={{
                  textDecoration: 'underline',
                  cursor: 'pointer',
                  color: '#367BF5',
               }}
            >
               Login
            </span>
         </div>
         <LoginWrapper
            closeLoginPopup={() => {
               setShowLoginPopup(false)
            }}
            showLoginPopup={showLoginPopup}
         />
      </>
   )
}
