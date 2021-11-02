import React, { useState, useEffect } from 'react'
import { signOut } from 'next-auth/client'
import { useRouter } from 'next/router'
import { useSubscription } from '@apollo/client'
import { useToasts } from 'react-toast-notifications'
import { Avatar, Badge, Menu, Popover, message } from 'antd'
import { NavBar } from './styles'
import CartDropdownMenu from './cartDropdown'
import ProfileDropdownMenu from './profileDropdown'
import Sidebar from './sidebar'
import Button from '../Button'
import Modal from '../Modal'
import Spacer from '../Spacer'
import { CartIcon, UserIcon, MenuIcon } from '../Icons'
import { useUser } from '../../Providers'
import { CART_INFO } from '../../graphql'
import { theme } from '../../theme.js'
import Login from '../login'
import { useScroll, useWindowDimensions, isClient } from '../../utils'

export default function NavBarComp({ navigationMenuItems, ...props }) {
   const [isSidebarVisible, SetIsSidebarVisible] = useState(false)
   const scroll = useScroll()
   const { width } = useWindowDimensions()
   const router = useRouter()
   const { addToast } = useToasts()
   const { state, toggleAuthenticationModal } = useUser()
   const {
      isAuthenticated = false,
      user = {},
      isAuthenticationModalOpen
   } = state
   const [showContent, setShowContent] = useState('login')

   const routes = [
      {
         id: '/exp-id',
         label: 'Experiences',
         url: '/experiences',
         isAllowedToShow: true,
         showInHeader: true
      },
      {
         id: '/exprt-id',
         label: 'Experts',
         url: '/experts',
         isAllowedToShow: true,
         showInHeader: true
      },
      {
         id: '/mp-id',
         label: 'My Polls',
         url: '/dashboard/myPolls',
         isAllowedToShow: isAuthenticated,
         showInHeader: false
      },
      {
         id: '/mb-id',
         label: 'My Bookings',
         url: '/dashboard/myBookings',
         isAllowedToShow: isAuthenticated,
         showInHeader: false
      }
   ]

   //query for cart Count
   const {
      data: { carts = [] } = {},
      isCartsLoading,
      error: cartsError
   } = useSubscription(CART_INFO, {
      variables: {
         keycloakId: user?.keycloakId,
         params: {
            shareFor: 'parent'
         }
      }
   })

   const openModal = () => {
      toggleAuthenticationModal(true)
   }
   const closeModal = () => {
      setShowContent('login')
      toggleAuthenticationModal(false)
   }

   const handleMenuClick = async event => {
      const { key } = event
      if (key === 'logout') {
         await signOut({ redirect: false })
         if (isClient) {
            window.location.href = window.location.origin + ''
         }
      } else if (!key.includes('dnd')) {
         router.push(key)
      } else {
         return
      }
   }

   useEffect(() => {
      if (isClient && localStorage.getItem('openLoginModal') === 'true') {
         message.warning('Kindly login first!')
         toggleAuthenticationModal(true)
         localStorage.removeItem('openLoginModal')
      }
   }, [])

   if (cartsError) {
      addToast('Something went wrong!', { appearance: 'error' })
      console.log(cartsError)
   }

   return (
      <>
         <Sidebar
            navigationMenuItems={navigationMenuItems}
            isSidebarVisible={isSidebarVisible}
            closeSidebar={() => SetIsSidebarVisible(false)}
            handleMenuClick={handleMenuClick}
            user={user}
            routes={routes}
         />
         <NavBar cartCount={carts.lenth} scroll={scroll} {...props}>
            {width < 769 && (
               <span onClick={() => SetIsSidebarVisible(true)}>
                  <MenuIcon size="38" color={theme.colors.textColor4} />
               </span>
            )}
            <span className="logo-img-wrapper" onClick={() => router.push('/')}>
               <img
                  className="logo-img"
                  src="/assets/images/stayIn-logo-1.png"
                  alt="stay-in-logo"
               />
            </span>
            <div className="menu-wrap">
               <Menu
                  onClick={handleMenuClick}
                  style={{ height: '100%', borderRight: 0 }}
                  defaultSelectedKeys={[router.pathname]}
                  mode="horizontal"
               >
                  {width > 769 &&
                     routes.map(
                        route =>
                           route.isAllowedToShow &&
                           route.showInHeader && (
                              <Menu.Item key={route.url}>
                                 {route.label}
                              </Menu.Item>
                           )
                     )}
                  {width > 769 &&
                     navigationMenuItems.map(menuItem => {
                        return (
                           <Menu.Item key={menuItem?.url}>
                              {menuItem?.label}
                           </Menu.Item>
                        )
                     })}
               </Menu>
               {isAuthenticated ? (
                  <div className="action-btn">
                     {width > 769 && (
                        <Popover
                           content={<CartDropdownMenu carts={carts} />}
                           trigger="click"
                           color={theme.colors.darkBackground.darkblue}
                        >
                           <Badge
                              count={carts.length}
                              color={theme.colors.textColor}
                              size="small"
                           >
                              <Avatar
                                 size={42}
                                 icon={
                                    <CartIcon
                                       size="28"
                                       color={theme.colors.textColor}
                                    />
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
                        </Popover>
                     )}

                     <Popover
                        content={
                           <ProfileDropdownMenu
                              className="profile-dropdown-div"
                              user={user}
                           />
                        }
                        trigger="click"
                        color={theme.colors.darkBackground.darkblue}
                     >
                        <Avatar
                           size={42}
                           icon={
                              <UserIcon
                                 size="32"
                                 color={theme.colors.textColor}
                              />
                           }
                           style={{
                              backgroundColor: theme.colors.textColor4,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              justifyItems: 'center'
                           }}
                        />
                     </Popover>
                  </div>
               ) : (
                  <div className="action-btn">
                     <Button
                        className="customBtn text10"
                        textColor={theme.colors.textColor}
                        backgroundColor={theme.colors.textColor4}
                        onClick={openModal}
                     >
                        Log In
                     </Button>
                  </div>
               )}
            </div>

            <Modal
               title={showContent === 'login' ? 'Log In' : 'Sign Up'}
               isOpen={isAuthenticationModalOpen}
               close={closeModal}
            >
               <Login
                  isOpen={isAuthenticationModalOpen}
                  showContent={showContent}
                  setShowContent={setShowContent}
                  authBtnClassName="auth-btn"
               />
            </Modal>
         </NavBar>
      </>
   )
}
