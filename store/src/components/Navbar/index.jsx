import React, { useState, useContext } from 'react'
import { Flex, Loader } from '@dailykit/ui'
import NavLink from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/router'
import { useQuery, useSubscription } from '@apollo/client'
import { useToasts } from 'react-toast-notifications'
import { Avatar, Badge } from 'antd'
import { NavBar, Wrapper } from './styles'
import DynamicMenu from './dynamicMenu'
import DropdownMenu from './dropdown'
import CartDropdownMenu from './cartDropdown'
import ProfileDropdownMenu from './profileDropdown'
import FloatingCartButton from './floatingCart'
import Sidebar from './sidebar'
import Button from '../Button'
import InlineLoader from '../InlineLoader'
import Modal from '../Modal'
import { CartIcon, SpinnerIcon, UserIcon, MenuIcon, CrossIcon } from '../Icons'
import useModal from '../useModal'
import { useUser } from '../../Providers'
import { useConfig } from '../../lib'
import { NAVBAR_MENU, CART_INFO } from '../../graphql'
import { theme } from '../../theme.js'
import { isClient, useWindowDimensions } from '../../utils'
import Login from '../login'
import Signup from '../signup'
import ForgotPassword from '../login/forgotPassword'

export default function NavBarComp({ navigationMenuItems }) {
   const { width } = useWindowDimensions()
   const [isFloatingButtonVisible, SetIsFloatingButtonVisible] = useState(false)
   const [isSidebarButtonVisible, SetIsSidebarButtonVisible] = useState(false)
   const { pathname } = useRouter()
   const {
      ModalContainer: LoginModalContainer,
      isShow: isLoginShow,
      show: showLogin,
      hide: hideLogin
   } = useModal()
   const {
      ModalContainer: SignupModalContainer,
      isShow: isSignupShow,
      show: showSignup,
      hide: hideSignup
   } = useModal()
   const { addToast } = useToasts()
   const { brand } = useConfig()
   const { state } = useUser()
   const { isAuthenticated = false, user = {}, loading } = state
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

   const closeModal = () => {
      setShowContent('login')
      hideLogin()
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
         />
         <FloatingCartButton
            carts={carts}
            isFloatingButtonVisible={isFloatingButtonVisible}
            toggleFloatingButton={() =>
               SetIsFloatingButtonVisible(prev => !prev)
            }
            showFloatingButton={() => SetIsFloatingButtonVisible(true)}
            hideFloatingButton={() => SetIsFloatingButtonVisible(false)}
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

                     {/* <Image
                  src={`https://ui-avatars.com/api/?name=${user?.email}&background=fff&color=15171F&size=500&rounded=true`}
                  alt="user"
                  layout="fill"
                /> */}
                     <ProfileDropdownMenu
                        className="profile-dropdown-div"
                        items={profileItems}
                        user={user}
                     />
                  </li>
               </>
            ) : (
               <ul className="nav-list">
                  {/* <li onClick={showSignup} className="buttonWrapper">
                     <Button
                        className="customBtn text10"
                        textColor={theme.colors.textColor}
                        backgroundColor={theme.colors.textColor4}
                     >
                        Sign Up
                     </Button>
                  </li> */}
                  <li onClick={showLogin} className="buttonWrapper">
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
            {/* {loading && (
          <ul className="nav-list">
            <InlineLoader />
          </ul>
        )} */}
            {/* <LoginModalContainer isShow={isLoginShow}>
               <Modal isOpen={isLoginShow} close={hideLogin} type="popup">
                  {showContent === 'login' ? (
                     <Login
                        isOpen={isLoginShow}
                        authBtnClassName="auth-btn"
                        isClicked={isClicked =>
                           isClicked && setShowContent('forgotPassword')
                        }
                     />
                  ) : (
                     <ForgotPassword
                        isOpen={isLoginShow}
                        authBtnClassName="auth-btn"
                     />
                  )}
               </Modal>
            </LoginModalContainer> */}

            <LoginModalContainer isShow={isLoginShow}>
               <Modal isOpen={isLoginShow} close={closeModal} type="popup">
                  <Login
                     isOpen={isLoginShow}
                     showContent={showContent}
                     setShowContent={setShowContent}
                     authBtnClassName="auth-btn"
                  />
               </Modal>
            </LoginModalContainer>
         </NavBar>
      </>
   )
}
