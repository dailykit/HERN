import React from 'react'
import { useOnClickOutside } from '@dailykit/ui'
import { DailykitIcon } from '../../../assets/icons'
import { Sidebar } from '../../Sidebar'
import Styles from '../styled'

const Logo = () => {
   const [open, setOpen] = React.useState(false)
   const menuRef = React.useRef()
   useOnClickOutside(menuRef, () => setOpen(false))

   return (
      <div ref={menuRef} style={{ padding: '0px 14px 0px 20px' }}>
         {open && <Sidebar setOpen={setOpen} />}
         <Styles.Logo open={open} onClick={() => setOpen(!open)}>
            <DailykitIcon />
         </Styles.Logo>
      </div>
   )
}

export default Logo
