import React, { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/router'
import { signOut } from 'next-auth/client'
import { CSSTransition } from 'react-transition-group'
import { DropdownWrapper } from './styles'
import { Spacer } from '../../components'
import { theme } from '../../theme'
import { isClient } from '../../utils'
import {
   PollIcon,
   BookingIcon,
   LogoutIcon,
   DashboardIcon
} from '../../components/Icons'

export default function ProfileDropdownMenu({ user, ...props }) {
   const router = useRouter()
   const [menuHeight, setMenuHeight] = useState(null)
   const dropdownRef = useRef(null)

   useEffect(() => {
      setMenuHeight(dropdownRef.current?.firstChild?.offsetHeight + 30)
   }, [])

   function calcHeight(el) {
      const height = el.offsetHeight
      setMenuHeight(height)
   }

   const handleClick = async url => {
      if (url !== 'logout') {
         router.push(`${url}`)
      } else {
         await signOut({ redirect: false })
         if (isClient) {
            window.location.href = window.location.origin
         }
      }
   }

   const DropdownMenuItem = ({ children, url }) => {
      return (
         <div className="dropdown-menu-item" onClick={() => handleClick(url)}>
            {children}
         </div>
      )
   }

   return (
      <DropdownWrapper {...props} ref={dropdownRef}>
         {/* <p style={{ color: theme.colors.textColor4, textAlign: 'center' }}>
            {user?.firstName && user?.firstName}{' '}
            {user?.lastName && user?.lastName}
         </p> */}
         <CSSTransition
            in={true}
            unmountOnExit
            timeout={500}
            classNames="menu-primary"
            onEnter={calcHeight}
         >
            <div className="dropdown-menu">
               <DropdownMenuItem url="/dashboard">
                  <DashboardIcon size="24" color={theme.colors.textColor4} />
                  <Spacer xAxis="16px" />
                  <p className="title profileFont">Dashboard</p>
               </DropdownMenuItem>
               <DropdownMenuItem url="/dashboard/myPolls">
                  <PollIcon
                     size="24"
                     backgroundColor={theme.colors.textColor4}
                     color={theme.colors.mainBackground}
                  />
                  <Spacer xAxis="16px" />
                  <p className="title profileFont">My Polls</p>
               </DropdownMenuItem>
               <DropdownMenuItem url="/dashboard/myBookings">
                  <BookingIcon
                     size="24"
                     backgroundColor={theme.colors.textColor4}
                     color={theme.colors.mainBackground}
                  />
                  <Spacer xAxis="16px" />
                  <p className="title profileFont ">My Bookings</p>
               </DropdownMenuItem>
               <DropdownMenuItem url="logout">
                  <LogoutIcon
                     size="24"
                     backgroundColor={theme.colors.textColor}
                     color={theme.colors.textColor4}
                  />
                  <Spacer xAxis="16px" />
                  <p className="title profileFont ">Logout</p>
               </DropdownMenuItem>
            </div>
         </CSSTransition>
      </DropdownWrapper>
   )
}
