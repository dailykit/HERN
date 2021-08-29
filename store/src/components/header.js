import React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { signOut } from 'next-auth/client'

import { useUser } from '../context'
import { isClient, getInitials, getRoute } from '../utils'
import MenuIcon from '../assets/icons/Menu'

import { ProfileSidebar } from './profile_sidebar'
import { CrossIcon } from '../assets/icons'
import { Loader } from './loader'
import NavigationBar from './navbar'

const ReactPixel = isClient ? require('react-facebook-pixel').default : null

export const Header = ({ settings, navigationMenus }) => {
   const router = useRouter()
   const { isAuthenticated, user, isLoading } = useUser()
   const logout = async () => {
      await signOut({ redirect: false })
      window.location.href = window.location.origin + getRoute('/')
   }

   const brand = settings['brand']['theme-brand']
   const theme = settings['Visual']['theme-color']

   const [toggle, setToggle] = React.useState(true)
   const [isMobileNavVisible, setIsMobileNavVisible] = React.useState(false)

   const newNavigationMenus = DataWithChildNodes(navigationMenus)

   // FB pixel event tracking for page view
   React.useEffect(() => {
      ReactPixel.pageView()
   }, [])
   return (
      <>
         <header className="hern-header">
            <Link
               href={getRoute('/')}
               title={brand?.name || 'Subscription Shop'}
            >
               <div className="hern-header__brand">
                  {brand?.logo?.logoMark && (
                     <img
                        src={brand?.logo?.logoMark}
                        alt={brand?.name || 'Subscription Shop'}
                     />
                  )}
                  {brand?.name && <span>{brand?.name}</span>}
               </div>
            </Link>
            <section className="hern-navigatin-menu__wrapper">
               {' '}
               <NavigationBar Data={newNavigationMenus}>
                  {isLoading ? (
                     <li>
                        <Loader inline={true} />
                     </li>
                  ) : isAuthenticated && user?.isSubscriber ? (
                     <li className="hern-navbar__list__item">
                        <Link href={getRoute('/menu')}>Select Menu</Link>
                     </li>
                  ) : (
                     <li className="hern-navbar__list__item">
                        <Link href={getRoute('/our-menu')}>Our Menu</Link>
                     </li>
                  )}
                  {!user?.isSubscriber && (
                     <li className="hern-navbar__list__item">
                        <Link href={getRoute('/our-plans')}>Get Started</Link>
                     </li>
                  )}
               </NavigationBar>
            </section>
            <section className="hern-header__auth">
               {isLoading ? (
                  <Loader inline={true} />
               ) : isAuthenticated ? (
                  <>
                     {user?.platform_customer?.firstName &&
                        (isClient && window.innerWidth > 768 ? (
                           <span className="hern-header__avatar">
                              <Link href={getRoute('/account/profile/')}>
                                 {getInitials(
                                    `${user.platform_customer.firstName} ${user.platform_customer.lastName}`
                                 )}
                              </Link>
                           </span>
                        ) : (
                           <span className="hern-header__avatar">
                              <Link href="#" onClick={() => setToggle(!toggle)}>
                                 {getInitials(
                                    `${user.platform_customer.firstName} ${user.platform_customer.lastName}`
                                 )}
                              </Link>
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
                     onClick={() => router.push(getRoute('/login'))}
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
                     {isAuthenticated && user?.isSubscriber ? (
                        <li className="hern-navbar__list__item">
                           <Link href={getRoute('/menu')}>Select Menu</Link>
                        </li>
                     ) : (
                        <li className="hern-navbar__list__item">
                           <Link href={getRoute('/our-menu')}>Our Menu</Link>
                        </li>
                     )}
                     {!user?.isSubscriber && (
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
         {isClient && window.innerWidth < 768 && (
            <ProfileSidebar toggle={toggle} logout={logout} />
         )}
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
