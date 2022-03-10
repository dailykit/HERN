import React from 'react'
import { Login } from '../components'
import { CSSTransition } from 'react-transition-group'
import { useConfig } from '../lib'

export const LoginWrapper = ({ ...props }) => {
   const { showLoginPopup } = props

   const { configOf, isConfigLoading } = useConfig()
   const authConfig = configOf('Auth Methods', 'brand')

   return (
      <CSSTransition
         in={showLoginPopup}
         timeout={300}
         unmountOnExit
         classNames="hern-login-v1__css-transition"
      >
         <div className="hern-login-v1-container">
            <div className="hern-login-v1-container__img">
               <img
                  src="https://dailykit-133-test.s3.us-east-2.amazonaws.com/misc/07680-user%20login.svg"
                  alt="Login"
               />
            </div>
            <Login
               {...props}
               socialLogin={authConfig.socialLoginMethods?.socialLogin?.value}
            />
         </div>
      </CSSTransition>
   )
}
