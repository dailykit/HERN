import React from 'react'
import Tabs from '../Tabs'
import Logo from './components/Logo'
import Styles from './styled'
import Tools from './components/Tools'

export const TabBar = () => {
   return (
      <Styles.Header>
         <Logo />
         <Tabs />
         <Tools />
      </Styles.Header>
   )
}
