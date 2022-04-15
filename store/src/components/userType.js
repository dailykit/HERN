import React from 'react'
import { Button } from '.'
import { useUser } from '../context'
import { LoginWrapper, isClient } from '../utils'
import { useConfig } from '../lib'
import { AiOutlineClose } from 'react-icons/ai'

export const UserType = () => {
   const { dispatch } = useUser()
   const { configOf } = useConfig()
   const theme = configOf('theme-color', 'Visual')?.themeColor
   const authConfig = configOf('Auth Methods', 'brand')

   const themeColor = theme?.accent?.value
      ? theme?.accent?.value
      : 'rgba(5, 150, 105, 1)'
   const [showLoginPopup, setShowLoginPopup] = React.useState(false)

   React.useEffect(() => {
      if (isClient && document.querySelector('.feedBack_button')) {
         if (showLoginPopup) {
            document.querySelector('.feedBack_button').style.display = 'none'
         } else {
            document.querySelector('.feedBack_button').style.display = 'block'
         }
      }
   }, [showLoginPopup])

   return (
      <div className="hern-user-type__wrapper">
         <LoginWrapper
            closeLoginPopup={() => {
               setShowLoginPopup(false)
            }}
            showLoginPopup={showLoginPopup}
         />
         {showLoginPopup ? (
            <span
               role={'button'}
               className="hern-login-close__btn"
               onClick={() => setShowLoginPopup(false)}
            >
               <AiOutlineClose size={24} />
            </span>
         ) : (
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
                        className="hern-user-type__guest"
                        onClick={() => {
                           localStorage.setItem('userType', 'guest')
                           dispatch({
                              type: 'SET_USER_TYPE',
                              payload: 'guest',
                           })
                        }}
                        style={{ color: themeColor }}
                     >
                        Continue as Guest
                     </span>
                  </>
               )}
            </div>
         )}
      </div>
   )
}
