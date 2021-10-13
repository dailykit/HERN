import React, { useState } from 'react'
import NavLink from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/router'
import { useSubscription } from '@apollo/client'
import { useToasts } from 'react-toast-notifications'
import { Avatar, Badge } from 'antd'
import { NavBar } from './styles'
import DynamicMenu from './dynamicMenu'
import CartDropdownMenu from './cartDropdown'
import ProfileDropdownMenu from './profileDropdown'
import Sidebar from './sidebar'
import Button from '../Button'
import Modal from '../Modal'
import { CartIcon, UserIcon } from '../Icons'
import { useUser } from '../../Providers'
import { CART_INFO } from '../../graphql'
import { theme } from '../../theme.js'
import Login from '../login'

export default function NavBarComp({ navigationMenuItems }) {
   const [isSidebarButtonVisible, SetIsSidebarButtonVisible] = useState(false)
   const { pathname } = useRouter()
   const { addToast } = useToasts()
   const { state } = useUser()
   const { isAuthenticated = false, user = {}, loading } = state
   const [isModalVisible, setIsModalVisible] = useState(false)
   const [showContent, setShowContent] = useState('login')

   const [profileItems] = useState([
      {
         id: 'my-polls-1',
         label: 'My Polls',
         url: '/myPolls',
         childNavigationMenuItems: []
      },
      {
         id: 'my-bookings-1',
         label: 'My Bookings',
         url: '/myBookings',
         childNavigationMenuItems: []
      }
   ])

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
      setIsModalVisible(true)
   }
   const closeModal = () => {
      setShowContent('login')
      setIsModalVisible(false)
   }

   if (cartsError) {
      addToast('Something went wrong!', { appearance: 'error' })
      console.log(cartsError)
   }

   return (
      <>
         <Sidebar
            navigationMenuItems={navigationMenuItems}
            isSidebarButtonVisible={isSidebarButtonVisible}
            toggleSidebarButton={() => SetIsSidebarButtonVisible(prev => !prev)}
            showSidebarButton={() => SetIsSidebarButtonVisible(true)}
            hideSidebarButton={() => SetIsSidebarButtonVisible(false)}
            cartCount={carts.length}
         />
         <NavBar cartCount={carts.lenth}>
            <div className="brand-logo-div">
               <Image
                  className="logo-img-2"
                  src="/assets/images/stayIn-logo-1.png"
                  alt="stay-in-logo"
                  layout="fill"
               />
            </div>

            <li className="nav-list-item">
               <NavLink href="/">
                  <a className={pathname === '/' && 'activeLink'}>Home</a>
               </NavLink>
            </li>
            <li className="nav-list-item">
               <NavLink href="/experiences">
                  <a className={pathname === '/experiences' && 'activeLink'}>
                     Experiences
                  </a>
               </NavLink>
            </li>
            <li className="nav-list-item">
               <NavLink href="/experts">
                  <a className={pathname === '/experts' && 'activeLink'}>
                     Experts
                  </a>
               </NavLink>
            </li>

            <DynamicMenu pathname={pathname} menuItems={navigationMenuItems} />
            <div className="spacer" />
            {isAuthenticated ? (
               <>
                  <li className="cart">
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
                     <CartDropdownMenu className="dropdown-div" carts={carts} />
                  </li>
                  <li className="profile">
                     <Avatar
                        size={42}
                        icon={
                           <UserIcon size="32" color={theme.colors.textColor} />
                        }
                        style={{
                           backgroundColor: theme.colors.textColor4,
                           display: 'flex',
                           alignItems: 'center',
                           justifyContent: 'center',
                           justifyItems: 'center'
                        }}
                     />

                     <ProfileDropdownMenu
                        className="profile-dropdown-div"
                        items={profileItems}
                        user={user}
                     />
                  </li>
               </>
            ) : (
               <ul className="nav-list">
                  <li onClick={openModal} className="buttonWrapper">
                     <Button
                        className="customBtn text10"
                        textColor={theme.colors.textColor}
                        backgroundColor={theme.colors.textColor4}
                     >
                        Log In
                     </Button>
                  </li>
               </ul>
            )}

            <Modal isOpen={isModalVisible} close={closeModal} type="popup">
               <Login
                  isOpen={isModalVisible}
                  showContent={showContent}
                  setShowContent={setShowContent}
                  authBtnClassName="auth-btn"
               />
            </Modal>
         </NavBar>
      </>
   )
}
