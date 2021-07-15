import React from 'react'

// Styled
import {
   StyledSidebar,
   StyledList,
   StyledListItem,
   StyledHeading,
} from './styled'

import { useTabs } from '../../../../shared/providers'
import { BrandListing } from '../../components'

const Sidebar = ({ visible, toggleSidebar }) => {
   const { addTab, switchTab } = useTabs()

   return (
      <StyledSidebar visible={visible}>
         <StyledHeading>Listings</StyledHeading>
         <StyledList onClick={() => toggleSidebar(visible => !visible)}>
            <StyledListItem onClick={() => switchTab('/content')}>
               Home
            </StyledListItem>
         </StyledList>
         <BrandListing />
      </StyledSidebar>
   )
}

export default Sidebar
