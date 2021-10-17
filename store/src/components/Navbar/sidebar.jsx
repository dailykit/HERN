import React from 'react'
import { signOut } from 'next-auth/client'
import { useRouter } from 'next/router'
import { Layout, Menu } from 'antd'
import { SidebarWrapper } from './styles'
import BackDrop from '../BackDrop'
import { useUser } from '../../Providers'
import { isClient } from '../../utils'

export default function Sidebar({
   routes = [],
   navigationMenuItems,
   isSidebarVisible,
   closeSidebar,
   handleMenuClick,
   user = 'Welcome'
}) {
   const router = useRouter()
   const { state } = useUser()
   const { isAuthenticated = false } = state

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
                  onClick={handleMenuClick}
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
