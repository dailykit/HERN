import React from 'react'

// State
import { useTabs } from '../../context'

// Styled
import {
   StyledSidebar,
   StyledList,
   StyledListItem,
   StyledHeading,
} from './styled'

const Sidebar = ({ visible, toggleSidebar }) => {
   const { addTab } = useTabs()
   return (
      <StyledSidebar visible={visible} onClick={() => toggleSidebar(false)}>
         <StyledHeading>Listings</StyledHeading>
         <StyledList>
            <StyledListItem
               onClick={() => addTab('Menu', '/subscription/menu')}
            >
               Menu
            </StyledListItem>
            <StyledListItem
               onClick={() => addTab('Add On Menu', '/subscription/addon-menu')}
            >
               Menu
            </StyledListItem>
            <StyledListItem
               onClick={() =>
                  addTab('Subscriptions', '/subscription/subscriptions')
               }
            >
               Subscriptions
            </StyledListItem>
         </StyledList>
      </StyledSidebar>
   )
}

export default Sidebar
