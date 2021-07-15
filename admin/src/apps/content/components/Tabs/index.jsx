import React from 'react'
import { useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

import { useTabs } from '../../context'
import { useWindowSize } from '../../../../shared/hooks'
import { StyledTabs, StyledTab, Button, Dropdown } from './styled'
import {
   CloseIcon,
   ChevronUp,
   ChevronDown,
} from '../../../../shared/assets/icons'

const address = 'apps.settings.components.tabs.'

const Tabs = () => {
   const view = useWindowSize()
   const { tabs, closeAllTabs } = useTabs()
   const [isOpen, setIsOpen] = React.useState(false)
   return (
      <>
         <StyledTabs>
            {tabs.slice(0, Math.floor(view.width / 300)).map((tab, index) => (
               <Tab
                  tab={tab}
                  key={tab.path}
                  index={index}
                  setIsOpen={setIsOpen}
               />
            ))}
         </StyledTabs>
         <Button onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
         </Button>
         {isOpen && (
            <Dropdown>
               <ul onClick={() => setIsOpen(false)}>
                  {tabs.length > 0 &&
                     tabs.map((tab, index) => (
                        <Tab
                           tab={tab}
                           index={index}
                           key={tab.path}
                           className="in_dropdown"
                        />
                     ))}
                  <li id="close_all" onClick={() => closeAllTabs()}>
                     Close all tabs
                  </li>
               </ul>
            </Dropdown>
         )}
      </>
   )
}

export default Tabs

const Tab = ({ index, tab, ...props }) => {
   const { t } = useTranslation()
   const location = useLocation()
   const { switchTab, removeTab } = useTabs()
   return (
      <StyledTab
         key={tab.path}
         onClick={() => switchTab(tab.path)}
         active={tab.path === location.pathname}
         {...props}
      >
         <span title={tab.title}>{tab.title}</span>
         <button
            title={t(address.concat('close tab'))}
            onClick={e => {
               e.stopPropagation()
               removeTab({ tab, index })
            }}
         >
            <CloseIcon color="#000" size="20" />
         </button>
      </StyledTab>
   )
}
