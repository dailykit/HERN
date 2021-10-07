import React, { useRef } from 'react'
import { Flex } from '@dailykit/ui'
import NavLink from 'next/link'
import { signOut } from 'next-auth/client'
import Image from 'next/image'
import { useRouter } from 'next/router'
import { Avatar, Badge } from 'antd'
import { SidebarWrapper } from './styles'
import DynamicMenu from './dynamicMenu'
import Button from '../Button'
import BackDrop from '../BackDrop'
import { MenuIcon, CrossIcon, CartIcon } from '../Icons'
import { useUser } from '../../Providers'
import { theme } from '../../theme.js'
import { isClient } from '../../utils'

export default function Sidebar({
   navigationMenuItems,
   isSidebarButtonVisible,
   toggleSidebarButton,
   showSidebarButton,
   hideSidebarButton
}) {
   const node = useRef()
   const router = useRouter()
   const { state } = useUser()
   const { isAuthenticated = false } = state
   const routes = [
      {
         id: '/h-id',
         label: 'Home',
         url: '/',
         isAllowedToShow: true
      },
      {
         id: '/exp-id',
         label: 'Experiences',
         url: '/experiences',
         isAllowedToShow: true
      },
      {
         id: '/exprt-id',
         label: 'Experts',
         url: '/experts',
         isAllowedToShow: true
      },
      {
         id: '/mp-id',
         label: 'My Polls',
         url: '/myPolls',
         isAllowedToShow: isAuthenticated
      },
      {
         id: '/mb-id',
         label: 'My Bookings',
         url: '/myBookings',
         isAllowedToShow: isAuthenticated
      }
   ]

   const logout = async () => {
      await signOut({ redirect: false })
      if (isClient) {
         window.location.href = window.location.origin + ''
      }
   }

   return (
      <>
         <SidebarWrapper
            ref={node}
            isSidebarButtonVisible={isSidebarButtonVisible}
         >
            <div className="sidebar-icon" onClick={toggleSidebarButton}>
               {isSidebarButtonVisible ? (
                  <CrossIcon size="38" color={theme.colors.textColor4} />
               ) : (
                  <MenuIcon size="38" color={theme.colors.textColor4} />
               )}
               <div className="brand-logo-div">
                  <Image
                     className="logo-img-2"
                     src="/assets/images/stayIn-logo-1.png"
                     alt="stay-in-logo"
                     layout="fill"
                  />
               </div>

               <Badge
                  count={0}
                  showZero
                  color={theme.colors.textColor}
                  size="small"
               >
                  <Avatar
                     size={42}
                     icon={
                        <CartIcon size="28" color={theme.colors.textColor} />
                     }
                     style={{
                        backgroundColor: theme.colors.textColor4,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        justifyItems: 'center'
                     }}
                  />
               </Badge>
            </div>
            <div className="sidebar-main">
               <ul className="nav-list">
                  <>
                     <div className="brand-logo-div">
                        <img
                           className="logo-img-2"
                           src="/assets/images/stayIn-neon-1.png"
                           alt="stay-in-logo"
                        />
                        <img
                           className="logo-img-3"
                           src="/assets/images/stayIn-logo-4.png"
                           alt="stay-in-logo"
                        />
                     </div>
                     {!isAuthenticated && (
                        <Flex
                           container
                           alignItems="center"
                           justifyContent="space-evenly"
                           margin="16px 0 "
                        >
                           <Button
                              className="custom-auth-btn"
                              onClick={() => router.push('/login')}
                           >
                              Login
                           </Button>
                           <Button
                              className="custom-auth-btn"
                              onClick={() => router.push('/login')}
                           >
                              Signup
                           </Button>
                        </Flex>
                     )}
                     {routes.map(route => (
                        <li className="nav-list-item" key={route.id}>
                           {route.isAllowedToShow && (
                              <NavLink href={route.url}>
                                 <a
                                    className={
                                       router.pathname === route.url &&
                                       'activeLink'
                                    }
                                 >
                                    {route.label}
                                 </a>
                              </NavLink>
                           )}
                        </li>
                     ))}

                     <DynamicMenu
                        pathname={router.pathname}
                        menuItems={navigationMenuItems}
                     />
                     {isAuthenticated && (
                        <li
                           className="nav-list-item"
                           style={{ padding: '8px' }}
                           onClick={logout}
                        >
                           Logout
                        </li>
                     )}
                  </>
               </ul>
            </div>
         </SidebarWrapper>
         <BackDrop show={isSidebarButtonVisible} close={hideSidebarButton} />
      </>
   )
}
