import React from 'react'
import { Login } from '../components'
import { CSSTransition } from 'react-transition-group'

export const LoginWrapper = ({ ...props }) => {
   const { showLoginPopup } = props
   return (
      <CSSTransition
         in={showLoginPopup}
         timeout={300}
         unmountOnExit
         classNames="hern-login-v1__css-transition"
      >
         <Login {...props} />
      </CSSTransition>
   )
}
