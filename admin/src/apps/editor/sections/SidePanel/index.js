import React from 'react'

// State
import { Context } from '../../state'
import { useTabs, useGlobalContext } from '../../context'
import { Dropdown, Flex, RadioGroup } from '@dailykit/ui'
// Components
import { Panel } from '../../components'

// Styles
import { SidebarWrapper, SidebarActions, Header } from './styles'
import { InlineLoader } from '../../../../shared/components'
import { toast } from 'react-toastify'
import { FormType, FileType } from '../../components/Popup'

// Assets
import {
   ChevronsRight,
   ChevronsLeft,
   PaintIcon,
   SettingsIcon,
   HamburgerIcon,
   GridIcon,
   LinkFileIcon,
} from '../../assets/Icons'

const SidePanel = () => {
   const { globalState, toggleSidePanel } = useGlobalContext()
   const [activePanelId, setActivePanelId] = React.useState(1)
   const PanelOptions = [
      {
         id: 1,
         title: (
            <PaintIcon
               size="20"
               color={activePanelId === 1 ? 'white' : '#555B6E'}
            />
         ),
      },
      {
         id: 2,
         title: (
            <SettingsIcon
               size="20"
               color={activePanelId === 2 ? 'white' : '#555B6E'}
            />
         ),
      },
      {
         id: 3,
         title: (
            <HamburgerIcon
               size="20"
               color={activePanelId === 3 ? 'white' : '#555B6E'}
            />
         ),
      },
      {
         id: 4,
         title: (
            <GridIcon
               size="20"
               color={activePanelId === 4 ? 'white' : '#555B6E'}
            />
         ),
      },
      {
         id: 5,
         title: (
            <LinkFileIcon
               size="20"
               color={activePanelId === 5 ? 'white' : '#555B6E'}
            />
         ),
      },
   ]
   return (
      <>
         <SidebarWrapper>
            <Header>
               <SidebarActions>
                  {globalState.isSidePanelVisible ? (
                     <>
                        <RadioGroup
                           options={PanelOptions}
                           active={1}
                           onChange={option => setActivePanelId(option.id)}
                        />
                        <Flex
                           container
                           alignItems="center"
                           justifyContent="space-around"
                        >
                           <span
                              className="sideBarArrow"
                              onClick={() => toggleSidePanel()}
                           >
                              <ChevronsRight size="20" />
                           </span>
                        </Flex>
                     </>
                  ) : (
                     <span
                        className="sideBarArrow"
                        onClick={() => toggleSidePanel()}
                     >
                        <ChevronsLeft size="20" />
                     </span>
                  )}
               </SidebarActions>
            </Header>
            {/* <div className="panel">{activePanelId === 5 && <Panel />}</div> */}
         </SidebarWrapper>
      </>
   )
}

export default SidePanel
