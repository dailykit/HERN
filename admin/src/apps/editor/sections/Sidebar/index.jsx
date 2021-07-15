import React from 'react'
import { useGlobalContext } from '../../context'
import { ComboButton, PlusIcon } from '@dailykit/ui'
// Components
import { FileExplorer } from '../../components'

// Styles
import { SidebarWrapper, StyledSidebar, StyledHeading } from './styles'

const Sidebar = ({ visible, toggleSidebar }) => {
   const { setPopupInfo } = useGlobalContext()
   const createNew = () => {
      setPopupInfo({
         createTypePopup: true,
         fileTypePopup: false,
         formTypePopup: false,
      })
   }
   return (
      <StyledSidebar visible={visible}>
         {/* <SidebarWrapper> */}
         <StyledHeading>
            <ComboButton type="solid" onClick={createNew}>
               <PlusIcon color="#fff" />
               Create New
            </ComboButton>
         </StyledHeading>
         <FileExplorer />

         {/* </SidebarWrapper> */}
      </StyledSidebar>
   )
}

export default Sidebar
