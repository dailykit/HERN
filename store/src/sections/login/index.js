import React from 'react'

import { isClient, LoginWrapper } from '../../utils'

const ReactPixel = isClient ? require('react-facebook-pixel').default : null

export const Login = () => {
   return (
      <LoginWrapper
         forceLogin={true}
         closeLoginPopup={() => () => {}}
         showLoginPopup={true}
         showLoginWarning={false}
      />
   )
}
