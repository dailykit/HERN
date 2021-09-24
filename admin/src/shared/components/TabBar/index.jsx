import React from 'react'
import Tabs from '../Tabs'
import Logo from './components/Logo'
import Styles from './styled'
import Tools from './components/Tools'
import { useLocalStorage } from '../../hooks'
import Breadcrumbs from './Breadcrumbs'

export const TabBar = () => {
   const [isTabHidden, setIsTabHidden] = useLocalStorage('isTabsHidden')
   return (
      <>
         <Styles.Header isTabHidden={isTabHidden}>
            <Logo />
            {!isTabHidden ? <Tabs /> : <Breadcrumbs />}
            <Tools isTabHidden={isTabHidden} setIsTabHidden={setIsTabHidden} />
         </Styles.Header>
         {!isTabHidden && <Breadcrumbs />}
      </>
   )
}
