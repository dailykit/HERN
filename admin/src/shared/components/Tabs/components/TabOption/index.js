import React from 'react'
import { Form, IconButton } from '@dailykit/ui'
import { Styles } from './styled'
import { useTabs } from '../../../../providers'
import { CloseIcon } from '../../../../assets/icons'

const TabOption = () => {
   const { tabs, removeTab, closeAllTabs, switchTab } = useTabs()
   return (
      <>
         {tabs.length > 0 && (
            <Styles.Wrapper>
               {/* <Styles.SmallText>Group tabs</Styles.SmallText>
               <Styles.Group>
                  <Styles.GroupText>Group by apps</Styles.GroupText>
                  <Form.Toggle
                     name="first_time"
                     onChange={() => console.log('HJ')}
                     value={'Val'}
                     size={32}
                  />
               </Styles.Group>
               <Styles.Group>
                  <Styles.GroupText>Group by components</Styles.GroupText>
                  <Form.Toggle
                     name="first_time"
                     onChange={() => console.log('TOGGLED')}
                     value={'Val'}
                     size={32}
                  />
               </Styles.Group> */}
               <Styles.CloseTab>
                  <Styles.SmallText>
                     Opened tabs ({tabs.length})
                  </Styles.SmallText>
                  <div onClick={() => closeAllTabs()}>Close All Tabs</div>
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
