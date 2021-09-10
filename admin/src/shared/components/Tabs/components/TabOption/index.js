import React from 'react'
import { Form, IconButton } from '@dailykit/ui'
import { Styles } from './styled'
import { useTabs } from '../../../../providers'
import { CloseIcon } from '../../../../assets/icons'

const TabOption = ({ setOpen }) => {
   const { tabs, removeTab, closeAllTabs, switchTab } = useTabs()
   const handleCloseAllTabs = () => {
      closeAllTabs()
      setOpen(false)
   }
   return (
      <>
         {tabs.length > 0 && (
            <Styles.Wrapper>
               <Styles.CloseTab>
                  <Styles.SmallText>
                     Opened tabs ({tabs.length})
                  </Styles.SmallText>
                  <div onClick={handleCloseAllTabs}>Close All Tabs</div>
               </Styles.CloseTab>
               <Styles.TabContainer>
                  {tabs.map((tab, index) => (
                     <Styles.Tab key={tab.path}>
                        <span
                           title={tab.title}
                           onClick={() => switchTab(tab.path)}
                        >
                           {tab.title}
                        </span>
                        <IconButton
                           type="ghost"
                           size="sm"
                           type="button"
                           title="Close Tab"
                           onClick={e => {
                              e.stopPropagation()
                              removeTab({ tab, index })
                           }}
                        >
                           <CloseIcon size={8} color="#202020" />
                        </IconButton>
                     </Styles.Tab>
                  ))}
               </Styles.TabContainer>
            </Styles.Wrapper>
         )}
      </>
   )
}
export default TabOption
