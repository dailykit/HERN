import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { signOut } from 'next-auth/client'
import { getProtectedRoutes, LoginWrapper } from '../utils'

import { useUser, useTranslation } from '../context'
import {
   isClient,
   getInitials,
   getRoute,
   LocationSelectorWrapper,
   useQueryParams,
   useQueryParamState,
} from '../utils'
import MenuIcon from '../assets/icons/Menu'

import { ProfileSidebar } from './profile_sidebar'
import { CrossIcon } from '../assets/icons'
import { Loader } from './loader'
import NavigationBar from './navbar'
import { useWindowSize } from '../utils/useWindowSize'
import { LanguageSwitch, TemplateFile } from '.'

const ReactPixel = isClient ? require('react-facebook-pixel').default : null

export const Header = ({ settings, navigationMenus }) => {
   const router = useRouter()
   const { width } = useWindowSize()
   const { isAuthenticated, user, isLoading } = useUser()
   const { t } = useTranslation()
   const logout = async () => {
      const currentPathName = router.pathname
      const isRouteProtected = Boolean(
         getProtectedRoutes(true).find(x => x === currentPathName)
      )
      await signOut({
         redirect: false,
      })

      if (isRouteProtected) {
         // router.push(signOutData.url)
         window.location.href = window.location.origin + getRoute('/')
      }
   }
   const params = useQueryParams()
   const [loginPopup, setLoginPopup, deleteLoginPopUp] =
      useQueryParamState('showLogin')

   const brand = settings['brand']['theme-brand']
   const theme = settings['Visual']['theme-color']
   const headerNavigationSettings =
      settings['navigation']?.['header-navigation']
   const isSubscriptionStore =
      settings?.availability?.isSubscriptionAvailable?.Subscription
         ?.isSubscriptionAvailable?.value
   const logo = settings?.brand?.['Brand Logo']?.brandLogo?.value
      ? settings?.brand?.['Brand Logo']?.brandLogo?.value
      : settings?.brand?.['Brand Logo']?.brandLogo?.default
   const displayName = settings?.brand?.['Brand Logo']?.brandName?.value
      ? settings?.brand?.['Brand Logo']?.brandName?.value
      : settings?.brand?.['Brand Logo']?.brandName?.value

   const [toggle, setToggle] = React.useState(true)
   const [isMobileNavVisible, setIsMobileNavVisible] = React.useState(false)
   const [showLoginPopup, setShowLoginPopup] = React.useState(false)
   const [showLocationSelectorPopup, setShowLocationSelectionPopup] =
      React.useState(false)

   const newNavigationMenus = DataWithChildNodes(navigationMenus)

   // FB pixel event tracking for page view
   React.useEffect(() => {
      ReactPixel.pageView()
   }, [])
   return (
      <>
         {console.log(settings, isSubscriptionStore)}
         {headerNavigationSettings?.headerNavigation?.custom?.value ? (
            <TemplateFile
               path={headerNavigationSettings?.headerNavigation?.path?.value}
               data={{}}
            />
         ) : (
            <header className="hern-header">
               <Link
                  href={getRoute('/')}
                  title={displayName || 'Subscription Shop'}
               >
                  <div className="hern-header__brand">
                     {logo && (
                        <img
                           src={logo}
                           alt={displayName || 'Subscription Shop'}
                        />
                     )}
                     {displayName && <span>{displayName}</span>}
                  </div>
               </Link>
               <button onClick={() => setShowLocationSelectionPopup(true)}>
                  {t('Location')}
               </button>
               <section className="hern-navigatin-menu__wrapper">
                  <NavigationBar Data={newNavigationMenus}>
                     <li className="hern-navbar__list__item">
                        <LanguageSwitch />
                     </li>
                     {isLoading ? (
                        <li className="hern-navbar__list__item__skeleton" />
                     ) : isAuthenticated &&
                       user?.isSubscriber &&
                       isSubscriptionStore ? (
                        <li className="hern-navbar__list__item">
                           <Link href={getRoute('/menu')}>
                              {t('Select Menu')}
                           </Link>
                        </li>
                     ) : (
                        <>
                           {isSubscriptionStore && (
                              <li className="hern-navbar__list__item">
                                 <Link href={getRoute('/our-menu')}>
                                    {t('Our Menu')}
                                 </Link>
                              </li>
                           )}
                        </>
                     )}
                     {!user?.isSubscriber && isSubscriptionStore && (
                        <li className="hern-navbar__list__item">
                           <Link href={getRoute('/our-plans')}>
                              {t('Get Started')}
                           </Link>
                        </li>
                     )}
                  </NavigationBar>
               </section>
               <section className="hern-header__auth">
                  {isLoading ? (
                     <>
                        <span className="hern-navbar__list__item__skeleton" />
                        <span className="hern-header__avatar__skeleton" />
                     </>
                  ) : isAuthenticated ? (
                     <>
                        {user?.platform_customer?.firstName &&
                           (isClient && width > 768 ? (
                              <span className="hern-header__avatar">
                                 <Link href={getRoute('/account/profile/')}>
                                    {getInitials(
                                       `${user.platform_customer.firstName} ${user.platform_customer.lastName}`
                                    )}
                                 </Link>
                              </span>
                           ) : (
                              <span
                                 className="hern-header__avatar"
                                 onClick={() => setToggle(!toggle)}
                              >
                                 {getInitials(
                                    `${user.platform_customer.firstName} ${user.platform_customer.lastName}`
                                 )}
                              </span>
                           ))}

                        <button
                           className="hern-header__logout-btn"
                           onClick={logout}
                        >
                           Logout
                        </button>
                     </>
                  ) : (
                     <button
                        className="hern-header__logout"
                        style={{
                           backgroundColor: `${
                              theme?.accent
                                 ? theme?.accent
                                 : 'rgba(37, 99, 235, 1)'
                           }`,
                        }}
                        onClick={() => setShowLoginPopup(true)}
                     >
                        Log In
                     </button>
                  )}
                  <button
                     className="hern-header__menu-btn"
                     onClick={() => setIsMobileNavVisible(!isMobileNavVisible)}
                  >
                     {isMobileNavVisible ? (
                        <CrossIcon stroke="#111" size={24} />
                     ) : (
                        <MenuIcon />
                     )}
                  </button>
               </section>
               {isMobileNavVisible && (
                  <section className="hern-navigatin-menu__wrapper--mobile">
                     <NavigationBar Data={newNavigationMenus}>
                        {isAuthenticated &&
                        user?.isSubscriber &&
                        isSubscriptionStore ? (
                           <li className="hern-navbar__list__item">
                              <Link href={getRoute('/menu')}>Select Menu</Link>
                           </li>
                        ) : (
                           <>
                              {isSubscriptionStore && (
                                 <li className="hern-navbar__list__item">
                                    <Link href={getRoute('/our-menu')}>
                                       Our Menu
                                    </Link>
                                 </li>
                              )}
                           </>
                        )}
                        {!user?.isSubscriber && isSubscriptionStore && (
                           <li className="hern-navbar__list__item">
                              <Link href={getRoute('/our-plans')}>
                                 Get Started
                              </Link>
                           </li>
                        )}
                     </NavigationBar>
                  </section>
               )}
            </header>
         )}
         <LocationSelectorWrapper
            showLocationSelectorPopup={showLocationSelectorPopup}
            setShowLocationSelectionPopup={setShowLocationSelectionPopup}
            settings={settings}
         />
         {isClient && width < 768 && (
            <ProfileSidebar toggle={toggle} logout={logout} />
         )}
         {/* <LoginWrapper
            closeLoginPopup={() => {
               setLoginPopup('false')
            }}
            showLoginPopup={Boolean(params['showLogin'] === 'true')}
         /> */}
         <LoginWrapper
            closeLoginPopup={() => setShowLoginPopup(false)}
            showLoginPopup={showLoginPopup}
         />
      </>
   )
}

const DataWithChildNodes = dataList => {
   dataList.map(each => {
      const newFilter = dataList.filter(
         x => x.parentNavigationMenuItemId === each.id
      )
      each.childNodes = newFilter
      return each
   })
   return dataList
}
