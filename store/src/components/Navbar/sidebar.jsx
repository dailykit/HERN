import React, { useRef } from 'react'
import { Flex } from '@dailykit/ui'
import NavLink from 'next/link'
import { signOut } from 'next-auth/client'
import Image from 'next/image'
import { useRouter } from 'next/router'
import { Layout, Menu } from 'antd'
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
   isSidebarVisible,
   closeSidebar,
   user = 'Welcome'
}) {
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
         url: '/dashboard/myPolls',
         isAllowedToShow: isAuthenticated
      },
      {
         id: '/mb-id',
         label: 'My Bookings',
         url: '/dashboard/myBookings',
         isAllowedToShow: isAuthenticated
      }
   ]

   const handleClick = async event => {
      const { key } = event
      if (key === 'logout') {
         await signOut({ redirect: false })
         if (isClient) {
            window.location.href = window.location.origin + ''
         }
      } else {
         router.push(key)
      }
   }

   return (
      <>
         <SidebarWrapper
            title={
               <>
                  <div className="brand-logo-div">
                     <img
                        className="logo-img"
                        src="/assets/images/stayIn-logo-1.png"
                        alt="stay-in-logo"
                     />
                  </div>
               </>
            }
            placement="left"
            closable={true}
            onClose={closeSidebar}
            visible={isSidebarVisible}
         >
            <Layout.Sider className="dashboard-sidebar">
               <Menu
                  onClick={handleClick}
                  style={{ height: '100%', borderRight: 0 }}
                  defaultSelectedKeys={[router.pathname]}
                  mode="inline"
               >
                  {routes.map(
                     route =>
                        route.isAllowedToShow && (
                           <Menu.Item key={route.url}>{route.label}</Menu.Item>
                        )
                  )}
                  {navigationMenuItems.map(menuItem => {
                     return (
                        <Menu.Item key={menuItem?.url}>
                           {menuItem?.label}
                        </Menu.Item>
                     )
                  })}
                  {isAuthenticated && (
                     <Menu.Item key="logout">Logout</Menu.Item>
                  )}
               </Menu>
            </Layout.Sider>
         </SidebarWrapper>
         <BackDrop show={isSidebarVisible} close={closeSidebar} />
      </>
   )
}
