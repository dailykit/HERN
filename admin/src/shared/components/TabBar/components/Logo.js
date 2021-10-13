import React from 'react'
import { Flex, useOnClickOutside } from '@dailykit/ui'
import { DailykitIcon, ChevronDown, ChevronUp } from '../../../assets/icons'
import { Sidebar } from '../../Sidebar'
import Styles from '../styled'

const Logo = () => {
   const [open, setOpen] = React.useState(true)
   const menuRef = React.useRef()
   // useOnClickOutside(menuRef, () => setOpen(false))

   return (
      <div
         ref={menuRef}
         style={{
            padding: '0px 12px 0px 12px',
            height: '48px',
            display: 'flex',
            alignItems: 'center',
         }}
      >
         {open && <Sidebar setOpen={setOpen} />}
         <Styles.Logo open={open} onClick={() => setOpen(!open)}>
            <DailykitIcon />
         </Styles.Logo>
      </div>
   )
}

export default Logo
