import React from 'react'
import { Login } from '../components'
import { CSSTransition } from 'react-transition-group'
import { useConfig } from '../lib'

export const LoginWrapper = ({ ...props }) => {
   const { showLoginPopup } = props

   const { configOf } = useConfig()
   const authConfig = configOf('Auth Methods', 'brand')

   /** Brand level config for login illustration **/
   const loginIllustration = configOf('Login Illustrations', 'brand')
   const illustration =
      loginIllustration?.['Login Illustration']?.illustrationImage?.value ??
      'https://dailykit-133-test.s3.us-east-2.amazonaws.com/images/16322-user_login.png' //fallback Image

   const showIllustration =
      loginIllustration?.['Login Illustration']?.showLoginIllustration?.value ??
      false //false as fallback value

   /**Hide or show scrollbar based on loginPopup open or close  */
   React.useEffect(() => {
      if (showLoginPopup) {
         document.querySelector('body').style.overflowY = 'hidden'
      }
      return () => {
         document.querySelector('body').style.overflowY = 'auto'
      }
   }, [showLoginPopup])

   return (
      <CSSTransition
         in={showLoginPopup}
         timeout={300}
         unmountOnExit
         classNames="hern-login-v1__css-transition"
      >
         <div className="hern-login-v1-container">
            {/**Illustration image */}
            {showIllustration && (
               <div className="hern-login-v1-container__img">
                  <img src={illustration} alt="Login" />
               </div>
            )}
            {/**Login Component */}
            <Login
               {...props}
               socialLogin={authConfig.socialLoginMethods?.socialLogin?.value}
            />
         </div>
      </CSSTransition>
   )
}
