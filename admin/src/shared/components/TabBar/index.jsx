import React from 'react'
import Tabs from '../Tabs'
import Logo from './components/Logo'
import Styles from './styled'
import Tools from './components/Tools'
import { useLocalStorage } from '../../hooks'
import Breadcrumbs from './Breadcrumbs'
import { useTabs } from '../../providers'

export const TabBar = () => {
   const [isTabHidden, setIsTabHidden] = useLocalStorage('isTabsHidden')
   const { tabs } = useTabs()
   return (
      <>
         <Styles.Header isTabHidden={isTabHidden}>
            <Logo />
            {tabs.length > 0 && !isTabHidden ? <Tabs /> : <Breadcrumbs />}
            <Tools isTabHidden={isTabHidden} setIsTabHidden={setIsTabHidden} />
         </Styles.Header>
         {tabs.length > 0 && !isTabHidden && <Breadcrumbs />}
      </>
   )
}
