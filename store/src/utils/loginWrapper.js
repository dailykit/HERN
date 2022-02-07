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
         <Login
            {...props}
            socialLogin={authConfig.socialLoginMethods?.socialLogin?.value}
         />
      </CSSTransition>
   )
}
