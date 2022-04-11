import React from 'react'
import { Button } from '.'
import { LoginSVG } from '../assets/icons'
import { useUser } from '../context'
import { LoginWrapper } from '../utils'
import { useConfig } from '../lib'

export const UserType = () => {
   const { dispatch } = useUser()
   const { configOf } = useConfig()
   const theme = configOf('theme-color', 'Visual')?.themeColor
   const authConfig = configOf('Auth Methods', 'brand')

   const themeColor = theme?.accent?.value
      ? theme?.accent?.value
      : 'rgba(5, 150, 105, 1)'
   const [showLoginPopup, setShowLoginPopup] = React.useState(false)

   return (
      <div className="hern-user-type__wrapper">
         <LoginWrapper
            closeLoginPopup={() => {
               setShowLoginPopup(false)
            }}
            showLoginPopup={showLoginPopup}
         />

         <div className="hern-user-type__content">
            <Button
               onClick={() => {
                  setShowLoginPopup(true)
               }}
            >
               Login
            </Button>
            {authConfig?.loginSettings?.guestMode?.value && (
               <>
                  <span className="hern-user-type__or">Or</span>
                  <span
                     className="hern-user-info__footer-guest"
                     onClick={() => {
                        localStorage.setItem('userType', 'guest')
                        dispatch({
                           type: 'SET_USER_TYPE',
                           payload: 'guest',
                        })
                     }}
                  >
                     style={{ color: themeColor }}
                     className= "hern-user-type__guest" Continue as Guest
                  </span>
               </>
            )}
         </div>
      </div>
   )
}
