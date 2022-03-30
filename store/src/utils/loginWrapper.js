import React from 'react'
import { Login } from '../components'
import { CSSTransition } from 'react-transition-group'
import { useConfig } from '../lib'
import isEmpty from 'lodash/isEmpty'
import isNull from 'lodash/isNull'

export const LoginWrapper = ({ ...props }) => {
   const { showLoginPopup, currentAuth = null } = props
   const { configOf } = useConfig()
   const authConfig = configOf('Auth Methods', 'brand')

   const loginBy = React.useMemo(() => {
      if (isEmpty(currentAuth) || isNull(currentAuth)) {
         if (authConfig?.loginSettings?.defaultLogInMethod?.value?.value) {
            return authConfig?.loginSettings?.defaultLogInMethod?.value?.value
         } else {
            return 'email'
         }
      } else {
         if (currentAuth === 'sign-up') {
            return 'signup'
         } else if (currentAuth === 'sign-in') {
            if (authConfig?.loginSettings?.defaultLogInMethod?.value?.value) {
               return authConfig?.loginSettings?.defaultLogInMethod?.value
                  ?.value
            } else {
               return 'email'
            }
         } else if (currentAuth === 'forgotPassword') {
            return 'forgotPassword'
         }
      }
   }, [currentAuth])

   /** Brand level config for login illustration **/
   const loginIllustration = configOf('Login Illustrations', 'brand')
   const illustration =
      loginIllustration?.['Login Illustration']?.illustrationImage?.value ??
      'https://dailykit-133-test.s3.us-east-2.amazonaws.com/images/16322-user_login.png' //fallback Image

   const showIllustration =
      loginIllustration?.['Login Illustration']?.showLoginIllustration?.value ??
      false //false as fallback value

   const loginBackgroundImages =
      loginIllustration?.['Login Background Image']?.backgroundImage?.value ??
      'https://dailykit-237-breezychef.s3.us-east-2.amazonaws.com/images/93576-Coupon%20Image%20%282%29.png' //fallback Image
   const showBackground =
      loginIllustration?.['Login Background Image']?.showBackground?.value ??
      false
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
         <div
            style={
               showBackground
                  ? {
                       backgroundImage: `url('${loginBackgroundImages}')`,
                       backgroundSize: 'contain',
                       backgroundPosition: 'center',
                       backgroundRepeat: 'no-repeat',
                       backgroundColor: '#fff',
                    }
                  : {}
            }
            className="hern-login-v1-container"
         >
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
               singleLoginMethod={
                  authConfig.loginSettings?.singleLoginMethod?.value || false
               }
               loginBy={loginBy}
               currentAuth={loginBy}
               showBackground={showBackground}
            />
         </div>
      </CSSTransition>
   )
}
