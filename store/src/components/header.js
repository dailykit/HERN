import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { signOut } from 'next-auth/client'
import {
   getProtectedRoutes,
   get_env,
   // LoginWrapper,
   formatCurrency,
   getStoresWithValidations,
   useQueryParamState,
} from '../utils'

import { CSSTransition } from 'react-transition-group'

import { useUser, CartContext, useTranslation } from '../context'
import { isClient, getRoute, LocationSelectorWrapper } from '../utils'
import { MenuIcon, UserIcon } from '../assets/icons'

import { ProfileSidebar } from './profile_sidebar'
import { CrossIcon, CartIcon, LocationIcon, DownVector } from '../assets/icons'

import NavigationBar from './navbar'
import { useWindowSize } from '../utils/useWindowSize'
import { LanguageSwitch, TemplateFile } from '.'
import classNames from 'classnames'
import { useConfig } from '../lib'
import isEmpty from 'lodash/isEmpty'
import isNull from 'lodash/isNull'
import dynamic from 'next/dynamic'

const LoginWrapper = dynamic('../utils/loginWrapper', { ssr: false }).then(
   promise => promise.LoginWrapper
)
const ReactPixel = isClient ? require('react-facebook-pixel').default : null

export const Header = ({ settings, navigationMenus }) => {
   const {
      dispatch,
      brand: configBrand,
      orderTabs,
      locationId,
      showLocationSelectorPopup,
      setShowLocationSelectionPopup,
   } = useConfig()
   const router = useRouter()
   const { width } = useWindowSize()

   const logout = async () => {
      const currentPathName = router.pathname
      const isRouteProtected = Boolean(
         getProtectedRoutes(true).find(x => x === currentPathName)
      )
      await signOut({
         redirect: false,
      })

      if (isRouteProtected) {
         window.location.href = get_env('BASE_BRAND_URL') + getRoute('/')
      }
      setStoredCartId(null)
   }
   const brand = settings['brand']['theme-brand']
   const headerNavigationSettings =
      settings['navigation']?.['header-navigation']?.headerNavigation
   console.log('header navigation : ', headerNavigationSettings?.layout.value)
   const showLocationButton =
      settings?.['navigation']?.['Show Location Selector']?.[
         'Location-Selector'
      ]?.['Location-Selector'].value ?? true

   const layoutStyle =
      headerNavigationSettings?.layout?.value?.value ?? 'layout-two'

   const [toggle, setToggle] = React.useState(true)
   const [isMobileNavVisible, setIsMobileNavVisible] = React.useState(false)
   const [showLoginPopup, setShowLoginPopup] = React.useState(false)
   const [address, setAddress] = useState(null)
   const [, setUserCoordinate] = useState({
      latitude: null,
      longitude: null,
   })

   const [fulfillmentType, setFulfillmentType] = useState(null)

   const newNavigationMenus = DataWithChildNodes(navigationMenus)

   const [currentAuth, setAuth, deleteAuth] = useQueryParamState('auth')
   React.useEffect(() => {
      if (!(isEmpty(currentAuth) || isNull(currentAuth))) {
         setShowLoginPopup(true)
      }
   }, [currentAuth])
   const {
      cartState,
      setStoredCartId,
      isFinalCartLoading,
      showCartIconToolTip,
   } = React.useContext(CartContext)

   // FB pixel event tracking for page view
   React.useEffect(() => {
      ReactPixel.pageView()
   }, [])

   React.useEffect(() => {
      if (!isFinalCartLoading) {
         const storeLocationId = localStorage.getItem('storeLocationId')
         if (storeLocationId && !locationId) {
            dispatch({
               type: 'SET_LOCATION_ID',
               payload: JSON.parse(storeLocationId),
            })
            const localUserLocation = JSON.parse(
               localStorage.getItem('userLocation')
            )
            setAddress({ ...localUserLocation })
            dispatch({
               type: 'SET_USER_LOCATION',
               payload: { ...localUserLocation },
            })
            dispatch({
               type: 'SET_STORE_STATUS',
               payload: {
                  status: true,
                  message: 'Store available on your location.',
                  loading: false,
               },
            })
         } else {
            const localUserLocation = localStorage.getItem('userLocation')
            if (localUserLocation) {
               const localUserLocationParse = JSON.parse(localUserLocation)
               setAddress({
                  ...localUserLocationParse,
               })
               dispatch({
                  type: 'SET_USER_LOCATION',
                  payload: {
                     ...localUserLocationParse,
                  },
               })
               return
            }
            const geolocation = isClient ? window.navigator.geolocation : false
            if (geolocation) {
               const success = position => {
                  const latitude = position.coords.latitude
                  const longitude = position.coords.longitude
                  setUserCoordinate(prev => ({ ...prev, latitude, longitude }))
                  fetch(
                     `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${get_env(
                        'GOOGLE_API_KEY'
                     )}`
                  )
                     .then(res => res.json())
                     .then(data => {
                        if (data?.status === 'OK' && data.results.length > 0) {
                           const formatted_address =
                              data.results[0].formatted_address.split(',')
                           const mainText = formatted_address
                              .slice(0, formatted_address.length - 3)
                              .join(',')
                           const secondaryText = formatted_address
                              .slice(formatted_address.length - 3)
                              .join(',')
                           const address = {}
                           data.results[0].address_components.forEach(node => {
                              if (node.types.includes('locality')) {
                                 address.city = node.long_name
                              }
                              if (
                                 node.types.includes(
                                    'administrative_area_level_1'
                                 )
                              ) {
                                 address.state = node.long_name
                              }
                              if (node.types.includes('country')) {
                                 address.country = node.long_name
                              }
                              if (node.types.includes('postal_code')) {
                                 address.zipcode = node.long_name
                              }
                           })
                           setAddress(prev => ({
                              ...prev,
                              mainText,
                              secondaryText,
                              latitude,
                              longitude,
                              ...address,
                           }))
                           dispatch({
                              type: 'SET_USER_LOCATION',
                              payload: {
                                 mainText,
                                 secondaryText,
                                 latitude,
                                 longitude,
                                 ...address,
                              },
                           })
                        }
                     })
                     .catch(e => {
                        console.log('error', e)
                     })
               }
               const error = () => {
                  console.log('this is error')
                  setShowLocationSelectionPopup(true)
                  dispatch({
                     type: 'SET_STORE_STATUS',
                     payload: {
                        status: true,
                        message: 'Please select location.',
                        loading: false,
                     },
                  })
               }
               geolocation.getCurrentPosition(success, error, {
                  maximumAge: 60000,
                  timeout: 15000,
                  enableHighAccuracy: true,
               })
            }
         }
      }
   }, [isFinalCartLoading])

   React.useEffect(() => {
      if (orderTabs.length > 0) {
         const localOrderTabLabel = localStorage.getItem('orderTab')
         if (localOrderTabLabel) {
            const selectedOrderTab = orderTabs.find(
               x =>
                  x.orderFulfillmentTypeLabel == JSON.parse(localOrderTabLabel)
            )
            dispatch({
               type: 'SET_SELECTED_ORDER_TAB',
               payload: selectedOrderTab,
            })
         } else {
            setFulfillmentType(orderTabs[0].orderFulfillmentTypeLabel)
         }
      }
   }, [orderTabs])

   React.useEffect(() => {
      if (!isFinalCartLoading) {
         const availableLocalLocationId =
            localStorage.getItem('storeLocationId')
         if (availableLocalLocationId) {
            return
         }
         if (address && configBrand.id && fulfillmentType) {
            async function fetchStores() {
               const brandClone = { ...configBrand }
               const availableStore = await getStoresWithValidations({
                  brand: brandClone,
                  fulfillmentType,
                  address,
                  autoSelect: true,
               })
               if (availableStore.length === 0) {
                  dispatch({
                     type: 'SET_STORE_STATUS',
                     payload: {
                        status: false,
                        message: 'No store available on this location.',
                        loading: false,
                     },
                  })
               } else {
                  const firstStoreOfSortedBrandLocation = availableStore[0]
                  const selectedOrderTab = orderTabs.find(
                     x => x.orderFulfillmentTypeLabel === fulfillmentType
                  )
                  dispatch({
                     type: 'SET_LOCATION_ID',
                     payload: firstStoreOfSortedBrandLocation.location.id,
                  })
                  dispatch({
                     type: 'SET_SELECTED_ORDER_TAB',
                     payload: selectedOrderTab,
                  })
                  dispatch({
                     type: 'SET_USER_LOCATION',
                     payload: address,
                  })
                  dispatch({
                     type: 'SET_STORE_STATUS',
                     payload: {
                        status: true,
                        message: 'Store available on your location.',
                        loading: false,
                     },
                  })
                  localStorage.setItem(
                     'orderTab',
                     JSON.stringify(fulfillmentType)
                  )
                  localStorage.setItem(
                     'storeLocationId',
                     JSON.stringify(firstStoreOfSortedBrandLocation.location.id)
                  )
                  localStorage.setItem(
                     'userLocation',
                     JSON.stringify({
                        latitude: address.lat,
                        longitude: address.lng,
                        ...address,
                     })
                  )
               }
            }
            fetchStores()
         }
      }
   }, [address, fulfillmentType, brand, isFinalCartLoading])
   return (
      <>
         {headerNavigationSettings?.headerNavigation?.custom?.value && (
            <TemplateFile
               path={headerNavigationSettings?.headerNavigation?.path?.value}
               data={{}}
            />
         )}
         {layoutStyle === 'layout-one' && (
            <LayoutOne
               settings={settings}
               logout={logout}
               toggle={toggle}
               setToggle={setToggle}
               setShowLoginPopup={setShowLoginPopup}
               isMobileNavVisible={isMobileNavVisible}
               setIsMobileNavVisible={setIsMobileNavVisible}
               showLocationButton={showLocationButton}
               address={address}
               newNavigationMenus={newNavigationMenus}
               currentAuth={currentAuth}
               setAuth={setAuth}
               deleteAuth={deleteAuth}
            />
         )}
         {layoutStyle === 'layout-two' && (
            <LayoutTwo
               settings={settings}
               logout={logout}
               toggle={toggle}
               setToggle={setToggle}
               setShowLoginPopup={setShowLoginPopup}
               isMobileNavVisible={isMobileNavVisible}
               setIsMobileNavVisible={setIsMobileNavVisible}
               showLocationButton={showLocationButton}
               address={address}
               newNavigationMenus={newNavigationMenus}
               currentAuth={currentAuth}
               setAuth={setAuth}
               deleteAuth={deleteAuth}
            />
         )}
         <LocationSelectorWrapper
            showLocationSelectorPopup={showLocationSelectorPopup}
            setShowLocationSelectionPopup={setShowLocationSelectionPopup}
            settings={settings}
         />
         {isClient && width < 768 && (
            <ProfileSidebar toggle={toggle} logout={logout} />
         )}
         <LoginWrapper
            closeLoginPopup={() => setShowLoginPopup(false)}
            showLoginPopup={showLoginPopup}
            currentAuth={currentAuth}
            setAuth={setAuth}
            deleteAuth={deleteAuth}
         />
      </>
   )
}
const LayoutOne = ({
   settings,
   logout,
   toggle,
   setToggle,
   setShowLoginPopup,
   isMobileNavVisible,
   setIsMobileNavVisible,
   showLocationButton,
   address,
   newNavigationMenus,
}) => {
   return (
      <header>
         <div className="hern-header--layout-one">
            {showLocationButton && (
               <LocationInfo
                  address={address}
                  settings={settings}
                  layout="layout-one"
               />
            )}
            <BrandInfo settings={settings} layout="layout-one" />
            <AuthMenu
               settings={settings}
               logout={logout}
               toggle={toggle}
               setToggle={setToggle}
               setShowLoginPopup={setShowLoginPopup}
               isMobileNavVisible={isMobileNavVisible}
               setIsMobileNavVisible={setIsMobileNavVisible}
               layout="layout-one"
            />
         </div>

         <Navigation
            settings={settings}
            newNavigationMenus={newNavigationMenus}
            layout="layout-one"
         />
         {showLocationButton && (
            <LocationInfo
               address={address}
               settings={settings}
               layout="layout-one"
               additionalClasses="hern-location-info--layout-one--sm"
            />
         )}

         <CSSTransition
            in={isMobileNavVisible}
            timeout={300}
            unmountOnExit
            classNames="hern-header__css-transition"
         >
            <MobileNavigationMenu
               settings={settings}
               newNavigationMenus={newNavigationMenus}
               layout="layout-one"
            />
         </CSSTransition>
      </header>
   )
}

const LayoutTwo = ({
   settings,
   logout,
   toggle,
   setToggle,
   setShowLoginPopup,
   isMobileNavVisible,
   setIsMobileNavVisible,
   showLocationButton,
   address,
   newNavigationMenus,
}) => {
   return (
      <header className="hern-header-stickey">
         <div className="hern-header--layout-two">
            <BrandInfo settings={settings} layout="layout-two" />
            <div
               style={{
                  marginLeft: 'auto',
                  display: 'flex',
                  alignItems: 'center',
               }}
            >
               <Navigation
                  settings={settings}
                  newNavigationMenus={newNavigationMenus}
                  layout="layout-two"
               />
               <AuthMenu
                  settings={settings}
                  logout={logout}
                  toggle={toggle}
                  setToggle={setToggle}
                  setShowLoginPopup={setShowLoginPopup}
                  isMobileNavVisible={isMobileNavVisible}
                  setIsMobileNavVisible={setIsMobileNavVisible}
                  layout="layout-two"
               />
            </div>
         </div>
         {showLocationButton && (
            <LocationInfo
               address={address}
               settings={settings}
               layout="layout-two"
            />
         )}

         {isMobileNavVisible && (
            <CSSTransition
               in={isMobileNavVisible}
               timeout={300}
               unmountOnExit
               classNames="hern-header__css-transition"
            >
               <MobileNavigationMenu
                  settings={settings}
                  newNavigationMenus={newNavigationMenus}
               />
            </CSSTransition>
         )}
      </header>
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

const LocationInfo = ({ settings, layout, additionalClasses }) => {
   const { selectedOrderTab, userLocation, storeStatus } = useConfig()
   const [showLocationSelectorPopup, setShowLocationSelectionPopup] =
      React.useState(false)
   const { t } = useTranslation()
   const prefix = React.useMemo(() => {
      const selectedOrderTabInLocal = isClient
         ? localStorage.getItem('orderTab')
         : null

      const fulfillmentType = selectedOrderTab?.orderFulfillmentTypeLabel
         ? selectedOrderTab?.orderFulfillmentTypeLabel
         : selectedOrderTabInLocal
         ? JSON.parse(selectedOrderTabInLocal)
         : null

      switch (fulfillmentType) {
         case 'PREORDER_DELIVERY':
            return 'DELIVER AT'
         case 'ONDEMAND_DELIVERY':
            return 'DELIVER AT'
         case 'PREORDER_PICKUP':
            return 'PICKUP FROM'
         case 'ONDEMAND_PICKUP':
            return 'PICKUP FROM'
         default:
            return null
      }
   }, [selectedOrderTab])

   const storeAddress = React.useMemo(() => {
      const storeAddress = isClient
         ? localStorage.getItem('pickupLocation')
         : ''

      if (storeAddress) {
         const parseStoreAddress = JSON.parse(
            localStorage.getItem('pickupLocation')
         )
         return parseStoreAddress
      } else {
         return null
      }
   }, [selectedOrderTab])

   return (
      <>
         <div
            className={classNames(
               'hern-header__location-container',
               additionalClasses,
               {
                  'hern-header__location-container--layout-one':
                     layout === 'layout-one',
               }
            )}
            onClick={() => setShowLocationSelectionPopup(true)}
         >
            <div className="hern-header__location-icon">
               <LocationIcon color="var(--hern-accent)" size={18} />
            </div>
            {storeStatus.loading ? (
               <div className="hern-header__location-right-loading">
                  {t('getting your location...')}
               </div>
            ) : (
               <div
                  className={classNames('hern-header__location-right', {
                     'hern-header__location-right--layout-two':
                        layout === 'layout-two',
                  })}
               >
                  {storeStatus?.status && prefix && (
                     <div className="hern-header__location-upper">
                        {t(prefix)}
                        <span className="hern-header__downvector-icon">
                           {prefix && <DownVector size={12} />}
                        </span>
                     </div>
                  )}
                  <div>
                     <div className="hern-header__location-content">
                        {prefix == 'DELIVER AT' &&
                           (userLocation?.label
                              ? userLocation?.label
                              : userLocation?.mainText
                              ? userLocation?.mainText
                              : userLocation?.address?.mainText
                              ? userLocation?.address?.mainText
                              : userLocation?.line1
                              ? userLocation?.line1
                              : t('Please select address...'))}
                        {prefix == 'PICKUP FROM' &&
                           storeAddress &&
                           (storeAddress.line1 ||
                              '' + storeAddress.line2 ||
                              '')}
                        {_.isNull(prefix) && t('Please select address...')}
                     </div>
                     <div className="hern-header__location-warning">
                        {!storeStatus?.status ? t(storeStatus?.message) : ''}
                     </div>
                  </div>
               </div>
            )}
         </div>
         <LocationSelectorWrapper
            showLocationSelectorPopup={showLocationSelectorPopup}
            setShowLocationSelectionPopup={setShowLocationSelectionPopup}
            settings={settings}
         />
      </>
   )
}
const BrandInfo = ({ settings, layout }) => {
   const logo = settings?.brand?.['Brand Info']?.brandLogo?.value
      ? settings?.brand?.['Brand Info']?.brandLogo?.value
      : settings?.brand?.['Brand Info']?.brandLogo?.default
   const logoForSmallDevice =
      settings?.brand?.['Brand Info']?.brandLogoSmall?.value
   const showLogo =
      settings?.brand?.['Brand Info']?.BrandLogo?.value ??
      settings?.brand?.['Brand Info']?.BrandLogo?.default ??
      true

   const displayName = settings?.brand?.['Brand Info']?.brandName?.value
      ? settings?.brand?.['Brand Info']?.brandName?.value
      : settings?.brand?.['Brand Info']?.brandName?.value
   const showBrandName =
      settings?.brand?.['Brand Info']?.BrandName?.value ??
      settings?.brand?.['Brand Info']?.BrandName?.default ??
      true

   return (
      <Link href={getRoute('/')} title={displayName || 'Subscription Shop'}>
         <div
            className={classNames('hern-header__brand', {
               'hern-header__auth--layout-one': layout === 'layout-one',
            })}
         >
            {logo && showLogo && (
               <>
                  <img
                     className={classNames({
                        'hern-header__brand__logo': logoForSmallDevice,
                     })}
                     src={logo}
                     alt={displayName || 'Subscription Shop'}
                  />
                  {logoForSmallDevice && (
                     <img
                        className="hern-header__brand__logo--sm"
                        src={logoForSmallDevice}
                        alt={displayName || 'Subscription Shop'}
                     />
                  )}
               </>
            )}
            {displayName && showBrandName && <span>{displayName}</span>}
         </div>
      </Link>
   )
}
const Navigation = ({ newNavigationMenus, settings, layout }) => {
   const { isAuthenticated, user, isLoading } = useUser()
   const isSubscriptionStore =
      settings?.availability?.isSubscriptionAvailable?.Subscription
         ?.isSubscriptionAvailable?.value
   const showLanguageSwitcher =
      settings?.['navigation']?.['language-translation']?.[
         'LanguageTranslation'
      ]?.['showLanguageTranslation'].value ?? true
   return (
      <section
         className={classNames('hern-navigatin-menu__wrapper', {
            'hern-navbar__list--layout-one': layout === 'layout-one',
         })}
      >
         <NavigationBar Data={newNavigationMenus}>
            {showLanguageSwitcher && (
               <li className="hern-navbar__list__item">
                  <LanguageSwitch />
               </li>
            )}
            {isLoading ? (
               <li className="hern-navbar__list__item__skeleton" />
            ) : isAuthenticated && user?.isSubscriber && isSubscriptionStore ? (
               <li className="hern-navbar__list__item">
                  <Link href={getRoute('/menu')}>{t('Select Menu')}</Link>
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
                  <Link href={getRoute('/our-plans')}>{t('Get Started')}</Link>
               </li>
            )}
         </NavigationBar>
      </section>
   )
}
const AuthMenu = ({
   settings,
   logout,
   toggle,
   setToggle,
   setShowLoginPopup,
   isMobileNavVisible,
   setIsMobileNavVisible,
   layout,
}) => {
   const { isAuthenticated, user, isLoading } = useUser()
   const router = useRouter()
   const { configOf } = useConfig()
   const { width } = useWindowSize()
   const theme = configOf('theme-color', 'Visual')?.themeColor
   const isSubscriptionStore =
      settings?.availability?.isSubscriptionAvailable?.Subscription
         ?.isSubscriptionAvailable?.value
   const {
      cartState,

      showCartIconToolTip,
   } = React.useContext(CartContext)
   const numberOfItemsOnCart =
      cartState?.cart?.cartItems_aggregate?.aggregate?.count

   const loginButtonLabel =
      settings?.brand['Login Illustrations']?.loginButton?.loginbuttonLabel
         .value ?? 'Log in'
   const roundedLoginButton =
      settings?.brand['Login Illustrations']?.loginButton?.roundedLoginButton
         .value ?? false

   return (
      <section className={classNames('hern-header__auth')}>
         {!isSubscriptionStore && (
            <div
               onClick={() => router.push(getRoute(`/checkout`))}
               className="hern-navbar__list__item hern-navbar__list__item--cart-icon"
            >
               <CartIcon size="20px" stroke="var(--hern-accent)" />
               <span className="number-of-cart-item">
                  {numberOfItemsOnCart}
               </span>
               {cartState.cart?.cartItems_aggregate?.aggregate?.count > 0 &&
                  showCartIconToolTip && (
                     <div
                        className="hern-navbar-cart-tooltip"
                        style={{
                           backgroundColor: `${
                              theme?.accent?.value
                                 ? theme?.accent?.value
                                 : 'rgba(37, 99, 235, 1)'
                           }`,
                           color: '#ffffff',
                        }}
                     >
                        {cartState.cart?.cartItems_aggregate?.aggregate?.count}{' '}
                        {cartState.cart?.cartItems_aggregate?.aggregate
                           ?.count === 1
                           ? 'Item'
                           : 'Items'}
                        {' - '}
                        {formatCurrency(
                           cartState.cart?.cartOwnerBilling?.balanceToPay
                        )}
                        <div
                           className="hern-navbar-cart-tooltip__tip"
                           style={{
                              backgroundColor: `var(--hern-accent)`,
                           }}
                        ></div>
                     </div>
                  )}
            </div>
         )}
         {isLoading ? (
            <>
               <span className="hern-navbar__list__item__skeleton" />
               <span className="hern-header__avatar__skeleton" />
            </>
         ) : isAuthenticated ? (
            <>
               {isClient && width > 767 ? (
                  <span className="hern-header__avatar">
                     <button
                        onClick={() =>
                           router.push(getRoute('/account/profile/'))
                        }
                     >
                        <UserIcon size="20" />
                     </button>
                  </span>
               ) : (
                  <span
                     className="hern-header__avatar"
                     onClick={() => setToggle(!toggle)}
                  >
                     <UserIcon size="20" />
                  </span>
               )}

               <button className="hern-header__logout-btn" onClick={logout}>
                  Logout
               </button>
            </>
         ) : (
            <button
               className={classNames('hern-header__logout', {
                  'hern-header__login-btn--rounded': roundedLoginButton,
               })}
               style={{
                  backgroundColor: `var(--hern-accent)`,
               }}
               onClick={() => setShowLoginPopup(true)}
            >
               {loginButtonLabel}
            </button>
         )}
         <button
            className="hern-header__menu-btn"
            onClick={() =>
               setIsMobileNavVisible(isMobileNavVisible => !isMobileNavVisible)
            }
         >
            {isMobileNavVisible ? (
               <CrossIcon stroke="#111" size={24} />
            ) : (
               <MenuIcon variant="hamburger" color="#111" />
            )}
         </button>
      </section>
   )
}
const MobileNavigationMenu = ({ settings, newNavigationMenus, layout }) => {
   const { isAuthenticated, user } = useUser()
   const isSubscriptionStore =
      settings?.availability?.isSubscriptionAvailable?.Subscription
         ?.isSubscriptionAvailable?.value

   return (
      <section
         className={classNames('hern-navigatin-menu__wrapper--mobile', {
            'hern-navigatin-menu__wrapper--mobile--layout-one':
               layout === 'layout-one',
         })}
      >
         <NavigationBar Data={newNavigationMenus}>
            {isAuthenticated && user?.isSubscriber && isSubscriptionStore ? (
               <li className="hern-navbar__list__item">
                  <Link href={getRoute('/menu')}>Select Menu</Link>
               </li>
            ) : (
               <>
                  {isSubscriptionStore && (
                     <li className="hern-navbar__list__item">
                        <Link href={getRoute('/our-menu')}>Our Menu</Link>
                     </li>
                  )}
               </>
            )}
            {!user?.isSubscriber && isSubscriptionStore && (
               <li className="hern-navbar__list__item">
                  <Link href={getRoute('/our-plans')}>Get Started</Link>
               </li>
            )}
         </NavigationBar>
      </section>
   )
}
