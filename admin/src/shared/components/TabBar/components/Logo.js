import React from 'react'
import { Flex, useOnClickOutside } from '@dailykit/ui'
import { DailykitIcon, ChevronDown, ChevronUp } from '../../../assets/icons'
import { Sidebar } from '../../Sidebar'
import Styles from '../styled'
import styled from 'styled-components'

const Logo = () => {
   const [open, setOpen] = React.useState(true)
   const menuRef = React.useRef()
   // useOnClickOutside(menuRef, () => setOpen(false))

   return (
      <div
         ref={menuRef}
         style={{
            padding: '8px 12px 0px 12px',
            height: '48px',
            display: 'flex',
            alignItems: 'center',
            gap: '20px',
         }}
      >
         {open && <Sidebar setOpen={setOpen} />}
         <Styles.Logo open={open} onClick={() => setOpen(!open)}>
            <DailykitIcon />
         </Styles.Logo>
         <StyledButton>
            Brand Name
            <ChevronDown size="14px" color="#555B6E" />
         </StyledButton>
      </div>
   )
}

export default Logo

const StyledButton = styled.button`
   width: 114px;
   height: 40px;
   background: #ffffff;
   border: none;
   border-radius: 6px;
   display: flex;
   align-items: center;
   justify-content: space-evenly;
`
