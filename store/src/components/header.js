import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { signOut } from 'next-auth/client'
import {
   getProtectedRoutes,
   get_env,
   LoginWrapper,
   autoSelectStore,
   formatCurrency,
} from '../utils'

import { useUser, useTranslation, CartContext } from '../context'
import {
   isClient,
   getInitials,
   getRoute,
   LocationSelectorWrapper,
   useQueryParams,
   useQueryParamState,
} from '../utils'
import { MenuIcon, UserIcon } from '../assets/icons'

import { ProfileSidebar } from './profile_sidebar'
import { CrossIcon, CartIcon, LocationIcon, DownVector } from '../assets/icons'

import NavigationBar from './navbar'
import { useWindowSize } from '../utils/useWindowSize'
import { LanguageSwitch, StoreList, TemplateFile, Button, Loader } from '.'
import classNames from 'classnames'
import { useConfig } from '../lib'
import { useQuery } from '@apollo/react-hooks'
import {
   BRAND_LOCATIONS,
   BRAND_ONDEMAND_DELIVERY_RECURRENCES,
   GET_BRAND_LOCATION,
   ONDEMAND_PICKUP_BRAND_RECURRENCES,
   PREORDER_DELIVERY_BRAND_RECURRENCES,
   PREORDER_PICKUP_BRAND_RECURRENCES,
} from '../graphql'

const ReactPixel = isClient ? require('react-facebook-pixel').default : null

export const Header = ({ settings, navigationMenus }) => {
   const {
      dispatch,
      brand: configBrand,
      orderTabs,
      locationId,
      selectedOrderTab,
      storeStatus,
   } = useConfig()
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
   const theme = settings['Visual']?.['theme-color']
   const headerNavigationSettings =
      settings['navigation']?.['header-navigation']
   const isSubscriptionStore =
      settings?.availability?.isSubscriptionAvailable?.Subscription
         ?.isSubscriptionAvailable?.value
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

   const showLocationButton =
      settings?.['navigation']?.['Show Location Selector']?.[
         'Location-Selector'
      ]?.['Location-Selector'].value ?? true
   const showLanguageSwitcher =
      settings?.['navigation']?.['language-translation']?.[
         'LanguageTranslation'
      ]?.['showLanguageTranslation'].value ?? true

   const showLocationText =
      settings?.['navigation']?.['Show Location Text']?.[
         'Show Location Text'
      ]?.['Show Location Text']?.value ?? true
   const [toggle, setToggle] = React.useState(true)
   const [isMobileNavVisible, setIsMobileNavVisible] = React.useState(false)
   const [showLoginPopup, setShowLoginPopup] = React.useState(false)
   const [showLocationSelectorPopup, setShowLocationSelectionPopup] =
      React.useState(false)
   const [address, setAddress] = useState(null)
   const [brandLocation, setBrandLocation] = useState(null)
   const [preOrderDeliveryRecurrences, setPreOrderDeliveryRecurrences] =
      useState(null)
   const [onDemandDeliveryRecurrence, setOnDemandDeliveryReoccurrence] =
      useState(null)
   const [onDemandPickupRecurrence, setOnDemandPickupReoccurrence] =
      useState(null)
   const [preOrderPickupRecurrence, setPreOrderPickupReoccurrence] =
      useState(null)
   const [userCoordinate, setUserCoordinate] = useState({
      latitude: null,
      longitude: null,
   })
   // const [storeStatus, setStoreStatus] = useState({
   //    status: false,
   //    message: '',
   //    loading: true,
   // })

   const newNavigationMenus = DataWithChildNodes(navigationMenus)

   const { cartState, showCartIconToolTip } = React.useContext(CartContext)
   const numberOfItemsOnCart =
      cartState?.cart?.cartItems_aggregate?.aggregate?.count

   // FB pixel event tracking for page view
   React.useEffect(() => {
      ReactPixel.pageView()
   }, [])

   React.useEffect(() => {
      const storeLocationId = localStorage.getItem('storeLocationId')
      if (storeLocationId) {
         dispatch({
            type: 'SET_LOCATION_ID',
            payload: JSON.parse(storeLocationId),
         })
         const localUserLocation = JSON.parse(
            localStorage.getItem('userLocation')
         )
         setAddress({ ...localUserLocation, ...localUserLocation.address })
         dispatch({
            type: 'SET_USER_LOCATION',
            payload: { ...localUserLocation, ...localUserLocation.address },
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
               ...localUserLocationParse.address,
            })
            dispatch({
               type: 'SET_USER_LOCATION',
               payload: {
                  ...localUserLocationParse,
                  ...localUserLocationParse.address,
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
                              node.types.includes('administrative_area_level_1')
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
            geolocation.getCurrentPosition(success, error)
         }
      }
   }, [])

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
         }
      }
   }, [orderTabs])

   // get all store when user address available
   const {
      loading: brandLocationLoading,
      data: { brands_brand_location_aggregate = {} } = {},
   } = useQuery(BRAND_LOCATIONS, {
      skip:
         !address?.city ||
         !address?.state ||
         !configBrand ||
         !configBrand?.id ||
         !orderTabs.find(
            x =>
               x.orderFulfillmentTypeLabel === 'ONDEMAND_DELIVERY' ||
               x.orderFulfillmentTypeLabel === 'PREORDER_DELIVERY'
         ),
      variables: {
         where: {
            _or: [
               {
                  location: {
                     city: { _eq: address?.city },
                     state: { _eq: address?.state },
                  },
               },
               {
                  _or: [
                     { doesDeliverOutsideCity: { _eq: true } },
                     { doesDeliverOutsideState: { _eq: true } },
                  ],
               },
            ],
            brandId: { _eq: configBrand.id },
         },
      },
      onError: error => {
         console.log(error)
      },
   })

   const { loading: preOrderBrandRecurrencesLoading } = useQuery(
      PREORDER_DELIVERY_BRAND_RECURRENCES,
      {
         skip:
            !brands_brand_location_aggregate?.nodes ||
            !brands_brand_location_aggregate?.nodes.length > 0 ||
            !configBrand ||
            !configBrand.id ||
            !orderTabs.length > 0 ||
            !orderTabs.find(
               x => x.orderFulfillmentTypeLabel === 'PREORDER_DELIVERY'
            ),
         variables: {
            where: {
               recurrence: {
                  isActive: { _eq: true },
                  type: { _eq: 'PREORDER_DELIVERY' },
               },
               _or: [
                  {
                     brandLocationId: {
                        _in: brands_brand_location_aggregate?.nodes?.map(
                           x => x.id
                        ),
                     },
                  },
                  { brandId: { _eq: configBrand.id } },
               ],
               isActive: { _eq: true },
            },
         },
         fetchPolicy: 'network-only',
         onCompleted: data => {
            if (data) {
               setPreOrderDeliveryRecurrences(data.brandRecurrences)
            }
         },
         onError: e => {
            console.log('preOrder brand recurrences error:::', e)
         },
      }
   )

   // onDemand delivery
   const { loading: brandRecurrencesLoading } = useQuery(
      BRAND_ONDEMAND_DELIVERY_RECURRENCES,
      {
         skip:
            !brands_brand_location_aggregate?.nodes ||
            !brands_brand_location_aggregate?.nodes.length > 0 ||
            !configBrand ||
            !configBrand.id ||
            !orderTabs.length > 0 ||
            !orderTabs.find(
               x => x.orderFulfillmentTypeLabel === 'ONDEMAND_DELIVERY'
            ),
         variables: {
            where: {
               recurrence: {
                  isActive: { _eq: true },
                  type: { _eq: 'ONDEMAND_DELIVERY' },
               },
               _or: [
                  {
                     brandLocationId: {
                        _in: brands_brand_location_aggregate?.nodes?.map(
                           x => x.id
                        ),
                     },
                  },
                  { brandId: { _eq: configBrand.id } },
               ],
               isActive: { _eq: true },
            },
         },
         fetchPolicy: 'network-only',
         onCompleted: data => {
            if (data) {
               setOnDemandDeliveryReoccurrence(data.brandRecurrences)
            }
         },
         onError: e => {
            console.log('Ondemand brand recurrences error:::', e)
         },
      }
   )

   const { loading: onDemandPickupRecurrenceLoading } = useQuery(
      ONDEMAND_PICKUP_BRAND_RECURRENCES,
      {
         skip:
            !configBrand ||
            !configBrand.id ||
            !orderTabs.length > 0 ||
            !orderTabs.find(
               x => x.orderFulfillmentTypeLabel === 'ONDEMAND_PICKUP'
            ),
         variables: {
            where: {
               isActive: { _eq: true },
               recurrence: {
                  isActive: { _eq: true },
                  type: { _eq: 'ONDEMAND_PICKUP' },
               },
               brandId: { _eq: configBrand.id },
            },
         },
         onCompleted: data => {
            if (data) {
               setOnDemandPickupReoccurrence(data.brandRecurrences)
            }
         },
      }
   )
   const { loading: preOrderPickRecurrencesLoading } = useQuery(
      PREORDER_PICKUP_BRAND_RECURRENCES,
      {
         skip:
            !configBrand ||
            !configBrand.id ||
            !orderTabs.length > 0 ||
            !orderTabs.find(
               x => x.orderFulfillmentTypeLabel === 'PREORDER_PICKUP'
            ),
         variables: {
            where: {
               isActive: { _eq: true },
               recurrence: {
                  isActive: { _eq: true },
                  type: { _eq: 'PREORDER_PICKUP' },
               },
               brandId: { _eq: configBrand.id },
            },
         },
         onCompleted: data => {
            if (data) {
               setPreOrderPickupReoccurrence(data.brandRecurrences)
            }
         },
      }
   )

   // get all store
   const { loading: storeLoading, error: storeError } = useQuery(
      GET_BRAND_LOCATION,
      {
         skip: !(configBrand || configBrand.id),
         variables: {
            where: {
               brandId: {
                  _eq: configBrand.id,
               },
            },
         },
         onCompleted: ({ brands_brand_location = [] }) => {
            if (brands_brand_location.length !== 0) {
               setBrandLocation(brands_brand_location)
               // getDataWithDrivableDistance(brands_brand_location)
            }
         },
         onError: error => {
            console.log('getBrandLocationError', error)
         },
      }
   )

   React.useEffect(() => {
      const availableLocalLocationId = localStorage.getItem('storeLocationId')
      if (availableLocalLocationId) {
         return
      }
      if (
         address &&
         brandLocation &&
         orderTabs.length > 0 &&
         (preOrderDeliveryRecurrences ||
            onDemandDeliveryRecurrence ||
            onDemandPickupRecurrence ||
            preOrderPickupRecurrence)
      ) {
         const type = orderTabs[0].orderFulfillmentTypeLabel
         let recurrencesDetails = {}
         switch (type) {
            case 'PREORDER_DELIVERY':
               recurrencesDetails = {
                  brandRecurrences: preOrderDeliveryRecurrences,
                  fulfillmentType: 'PREORDER_DELIVERY',
               }
               break
            case 'ONDEMAND_DELIVERY':
               recurrencesDetails = {
                  brandRecurrences: onDemandDeliveryRecurrence,
                  fulfillmentType: 'ONDEMAND_DELIVERY',
               }
               break
            case 'ONDEMAND_PICKUP':
               recurrencesDetails = {
                  brandRecurrences: onDemandPickupRecurrence,
                  fulfillmentType: 'ONDEMAND_PICKUP',
               }
               break
            case 'PREORDER_PICKUP':
               recurrencesDetails = {
                  brandRecurrences: preOrderPickupRecurrence,
                  fulfillmentType: 'PREORDER_PICKUP',
               }
               break
         }
         ;(async () => {
            const [result, fulfillmentStatus] = await autoSelectStore(
               brandLocation,
               recurrencesDetails.brandRecurrences,
               recurrencesDetails.fulfillmentType
            )
            const availableStores = result.filter(
               x => x[fulfillmentStatus]?.status
            )
            if (availableStores.length > 0) {
               localStorage.setItem(
                  'orderTab',
                  JSON.stringify(recurrencesDetails.fulfillmentType)
               )
               localStorage.setItem(
                  'storeLocationId',
                  JSON.stringify(availableStores[0].location.id)
               )
               dispatch({
                  type: 'SET_LOCATION_ID',
                  payload: availableStores[0].location.id,
               })
               dispatch({
                  type: 'SET_SELECTED_ORDER_TAB',
                  payload: recurrencesDetails.fulfillmentType,
               })
               localStorage.setItem(
                  'userLocation',
                  JSON.stringify({
                     latitude: userCoordinate.latitude,
                     longitude: userCoordinate.longitude,
                     address: {
                        mainText,
                        secondaryText,
                        ...address,
                     },
                  })
               )
               // if (isClient) {
               //    window.location.reload()
               // }
            } else {
               const message = result[0][fulfillmentStatus]?.message
               console.log('message', message)
               dispatch({
                  type: 'SET_STORE_STATUS',
                  payload: {
                     status: false,
                     message: message,
                     loading: false,
                  },
               })
            }
         })()
      }
   }, [
      address,
      brandLocation,
      orderTabs,
      preOrderDeliveryRecurrences,
      onDemandPickupRecurrence,
      onDemandDeliveryRecurrence,
      preOrderPickupRecurrence,
   ])

   React.useEffect(() => {
      console.log(
         'brands_brand_location_aggregate',
         brands_brand_location_aggregate
      )
      if (
         brands_brand_location_aggregate?.nodes &&
         brands_brand_location_aggregate?.nodes.length == 0
      ) {
         dispatch({
            type: 'SET_STORE_STATUS',
            payload: {
               status: false,
               message: 'No store available on this location.',
               loading: false,
            },
         })
      }
   }, [brands_brand_location_aggregate])
   return (
      <>
         {console.log(settings, isSubscriptionStore)}
         {headerNavigationSettings?.headerNavigation?.custom?.value ? (
            <TemplateFile
               path={headerNavigationSettings?.headerNavigation?.path?.value}
               data={{}}
            />
         ) : (
            <>
               <header
                  className={classNames('hern-header', {
                     'hern-header--grid-3-col': !showLocationButton,
                  })}
               >
                  <Link
                     href={getRoute('/')}
                     title={displayName || 'Subscription Shop'}
                  >
                     <div className="hern-header__brand">
                        {logo && showLogo && (
                           <>
                              <img
                                 class={classNames({
                                    'hern-header__brand__logo':
                                       logoForSmallDevice,
                                 })}
                                 src={logo}
                                 alt={displayName || 'Subscription Shop'}
                              />
                              {logoForSmallDevice && (
                                 <img
                                    class="hern-header__brand__logo--sm"
                                    src={logoForSmallDevice}
                                    alt={displayName || 'Subscription Shop'}
                                 />
                              )}
                           </>
                        )}
                        {displayName && showBrandName && (
                           <span>{displayName}</span>
                        )}
                     </div>
                  </Link>
                  <div className="hern-header__location-in-navbar">
                     {showLocationButton && (
                        <LocationInfo address={address} settings={settings} />
                     )}
                  </div>
                  {/* {address && <StoreList settings={settings} />} */}
                  <section className="hern-navigatin-menu__wrapper">
                     <NavigationBar Data={newNavigationMenus}>
                        {showLanguageSwitcher && (
                           <li className="hern-navbar__list__item">
                              <LanguageSwitch />
                           </li>
                        )}
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
                     {!isSubscriptionStore && (
                        <div
                           onClick={() => router.push(getRoute(`/checkout`))}
                           className="hern-navbar__list__item hern-navbar__list__item--cart-icon"
                        >
                           <CartIcon size="20px" stroke="var(--hern-accent)" />
                           <span className="number-of-cart-item">
                              {numberOfItemsOnCart}
                           </span>
                           {cartState.cart?.cartItems_aggregate?.aggregate
                              ?.count > 0 &&
                              showCartIconToolTip && (
                                 <div
                                    className="hern-navbar-cart-tooltip"
                                    style={{
                                       backgroundColor: `${
                                          theme?.accent
                                             ? theme?.accent
                                             : 'rgba(37, 99, 235, 1)'
                                       }`,
                                       color: '#ffffff',
                                    }}
                                 >
                                    {
                                       cartState.cart?.cartItems_aggregate
                                          ?.aggregate?.count
                                    }{' '}
                                    {cartState.cart?.cartItems_aggregate
                                       ?.aggregate?.count === 1
                                       ? 'Item'
                                       : 'Items'}
                                    {' - '}
                                    {formatCurrency(
                                       cartState.cart?.cartOwnerBilling
                                          ?.balanceToPay
                                    )}
                                    <div
                                       className="hern-navbar-cart-tooltip__tip"
                                       style={{
                                          backgroundColor: `${
                                             theme?.accent
                                                ? theme?.accent
                                                : 'rgba(37, 99, 235, 1)'
                                          }`,
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
                                       router.push(
                                          getRoute('/account/profile/')
                                       )
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
                        onClick={() =>
                           setIsMobileNavVisible(!isMobileNavVisible)
                        }
                     >
                        {isMobileNavVisible ? (
                           <CrossIcon stroke="#111" size={24} />
                        ) : (
                           <MenuIcon color="#111" />
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
                                 <Link href={getRoute('/menu')}>
                                    Select Menu
                                 </Link>
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
               {showLocationButton && (
                  <div className="hern-header__mobile-view-header">
                     <LocationInfo address={address} settings={settings} />
                  </div>
               )}
            </>
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

const LocationInfo = ({ settings }) => {
   const { selectedOrderTab, userLocation, storeStatus } = useConfig()
   const [showLocationSelectorPopup, setShowLocationSelectionPopup] =
      React.useState(false)

   const prefix = React.useMemo(() => {
      if (!selectedOrderTab) {
         return null
      }
      const type = selectedOrderTab.orderFulfillmentTypeLabel
      switch (type) {
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
   // if (storeStatus.loading) {
   //    return <Loader inline />
   // }

   return (
      <>
         <div
            className="hern-header__location-container"
            onClick={() => setShowLocationSelectionPopup(true)}
         >
            <div className="hern-header__location-icon">
               <LocationIcon size={18} />
            </div>
            {storeStatus.loading ? (
               <div className="hern-header__location-right-loading">
                  getting your location...
               </div>
            ) : (
               <div className="hern-header__location-right">
                  {storeStatus?.status && prefix && (
                     <div className="hern-header__location-upper">
                        {prefix}{' '}
                        <span className="hern-header__downvector-icon">
                           {prefix && <DownVector size={12} />}
                        </span>
                     </div>
                  )}
                  <div>
                     <div className="hern-header__location-content">
                        {userLocation?.mainText
                           ? userLocation?.mainText
                           : userLocation?.address?.mainText
                           ? userLocation?.address?.mainText
                           : 'Please select address...'}
                     </div>
                     <div className="hern-header__location-warning">
                        {!storeStatus?.status ? storeStatus?.message : ''}
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
