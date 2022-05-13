import { useQuery } from '@apollo/react-hooks'
// import { has, isEmpty } from 'lodash'
import has from 'lodash/has'
import isEmpty from 'lodash/isEmpty'
import React from 'react'
import { ORDER_TAB } from '../graphql'
import { get_env, isClient, useQueryParamState } from '../utils'
const ConfigContext = React.createContext()

const initialState = {
   brand: {
      id: null,
   },
   settings: {},
   orderTabs: [],
   kioskId: null,
   selectedOrderTab: null,
   kioskDetails: null,
   locationId: null,
   isIdleScreen: true,
   userLocation: null, // this location only for get store location,
   storeStatus: {
      status: false,
      message: '',
      loading: true,
   },
   lastLocationId: null,
   kioskRecurrences: null,
   kioskAvailability: {
      ONDEMAND_PICKUP: false,
      ONDEMAND_DINEIN: false,
      isValidated: false, // show that above two values are validate or not, initially false
   },
   KioskConfig: null,
   brandLocation: null,
}

const reducers = (state, { type, payload }) => {
   switch (type) {
      case 'SET_BRANDID':
         return { ...state, brand: payload }
      case 'SET_SETTINGS':
         return { ...state, settings: payload }
      case 'SET_ORDER_TAB':
         return { ...state, orderTabs: payload }
      case 'SET_KIOSK_ID':
         return { ...state, kioskId: payload }
      case 'SET_SELECTED_ORDER_TAB':
         return { ...state, selectedOrderTab: payload }
      case 'SET_KIOSK_DETAILS':
         return { ...state, kioskDetails: payload }
      case 'SET_LOCATION_ID':
         return { ...state, locationId: payload }
      case 'SET_IDLE_SCREEN':
         return { ...state, isIdleScreen: payload }
      case 'SET_USER_LOCATION':
         return { ...state, userLocation: payload }
      case 'SET_STORE_STATUS':
         return { ...state, storeStatus: payload }
      case 'SET_LAST_LOCATION_ID':
         return { ...state, lastLocationId: payload }
      case 'SET_KIOSK_RECURRENCES':
         return { ...state, kioskRecurrences: payload }
      case 'SET_KIOSK_POPUP_CONFIG':
         return { ...state, KioskConfig: payload }
      case 'SET_KIOSK_AVAILABILITY': {
         return {
            ...state,
            kioskAvailability: { ...state.kioskAvailability, ...payload },
         }
      }
      case 'SET_BRAND_LOCATION':
         return {
            ...state,
            brandLocation: payload,
         }
      default:
         return state
   }
}

export const ConfigProvider = ({ children }) => {
   const [isLoading, setIsLoading] = React.useState(true)
   const [state, dispatch] = React.useReducer(reducers, initialState)
   const [orderInterfaceType, setOrderInterfaceType] = React.useState(null)
   const [currentPage, setCurrentPage, deleteCurrentPage] = useQueryParamState(
      'currentPage',
      'fulfillmentPage'
   )
   const [currentAuth, setAuth, deleteAuth] = useQueryParamState('auth')

   const [showLocationSelectorPopup, setShowLocationSelectionPopup] =
      React.useState(false)

   useQuery(ORDER_TAB, {
      skip: isLoading || !orderInterfaceType,
      variables: {
         where: {
            isActive: { _eq: true },
            availableOrderInterfaceLabel: { _eq: orderInterfaceType?.oiType },
            brandId: { _eq: state.brand.id },
         },
      },
      onCompleted: data => {
         if (data) {
            dispatch({
               type: 'SET_ORDER_TAB',
               payload: data.brands_orderTab,
            })
         }
      },
      onError: error => {
         console.log('this is orderTab data', error)
      },
   })

   // set isIdleScreen
   const setIsIdleScreen = value => {
      dispatch({
         type: 'SET_IDLE_SCREEN',
         payload: value,
      })
   }

   // clear out the current page
   const clearCurrentPage = () => {
      deleteCurrentPage('currentPage')
      if (isClient) {
         const search = window.location.search
         let queryParams = new URLSearchParams(search)
         queryParams.delete('productCategoryId')
         history.replaceState(null, null, '?' + queryParams.toString())
         localStorage.removeItem('cart-id')
         dispatch({
            type: 'SET_SELECTED_ORDER_TAB',
            payload: null,
         })
      }
   }

   const buildImageUrl = React.useCallback((size, url) => {
      const server_url = `${
         new URL(get_env('DATA_HUB_HTTPS')).origin
      }/server/images`
      let bucket = ''
      if (new URL(url).host.split('.').length > 0) {
         bucket = new URL(url).host.split('.')[0]
      }
      const name = url.slice(url.lastIndexOf('/') + 1)

      return `${server_url}/http://${bucket}.s3-website.us-east-2.amazonaws.com\\${size}\\${name}`
   }, [])

   // handle order interfce for brand
   React.useEffect(() => {
      const oiType = JSON.parse(localStorage.getItem('orderInterfaceType'))
      const oiTypeId = JSON.parse(localStorage.getItem('orderInterfaceTypeId'))

      // const urlSearchParams = new URLSearchParams(window.location.search)
      // const params = Object.fromEntries(urlSearchParams.entries())
      const pathName = isClient ? window.location.pathname : ''

      if (pathName.includes('/kiosk/')) {
         localStorage.setItem(
            'orderInterfaceType',
            JSON.stringify('Kiosk Ordering')
         )
         setOrderInterfaceType(prev => ({ ...prev, oiType: 'Kiosk Ordering' }))
         // if (params.oiTypeId) {
         //    localStorage.setItem(
         //       'orderInterfaceTypeId',
         //       JSON.stringify(params.oiTypeId)
         //    )
         //    setOrderInterfaceType(prev => ({
         //       ...prev,
         //       oiTypeId: params.oiTypeId,
         //    }))
         // }
      } else {
         localStorage.setItem('orderInterfaceType', JSON.stringify('Website'))
         setOrderInterfaceType(prev => ({
            ...prev,
            oiType: 'Website',
            ...(oiTypeId && { oiTypeId }),
         }))
      }
   }, [])
   return (
      <ConfigContext.Provider
         value={{
            isConfigLoading: isLoading,
            state,
            dispatch,
            buildImageUrl,
            noProductImage:
               'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAZAAAAEsCAYAAADtt+XCAAAbvklEQVR4Xu3dabP0RMEG4EFEQVBkUTYVkV3//7/wqwv76oKgsoMC8tZ9qvp58zSZSdLTZ5npa6ooKM6kJ311p+8sneSO3//+99/ufAgQIECAwEaBOwTIRjFfJ0CAAIELAQGiIxAgQIBAk4AAaWKzEAECBAgIEH2AAAECBJoEBEgTm4UIECBAQIDoAwQIECDQJCBAmtgsRIAAAQICRB8gQIAAgSYBAdLEZiECBAgQECD6AAECBAg0CQiQJjYLESBAgIAA0QcIECBAoElAgDSxWYgAAQIEBIg+QIAAAQJNAgKkic1CBAgQICBA9AECBAgQaBIQIE1sFiJAgAABAaIPECBAgECTgABpYrMQAQIECAgQfYAAAQIEmgQESBObhQgQIEBAgOgDBAgQINAkIECa2CxEgAABAgJEHyBAgACBJgEB0sRmIQIECBAQIPoAAQIECDQJCJAmNgsRIECAgADRBwgQIECgSUCANLFZiAABAgQEiD5AgAABAk0CAqSJzUIECBAgIED0AQIECBBoEhAgTWwWIkCAAAEBog8QIECAQJOAAGlisxABAgQICBB9gAABAgSaBARIE5uFCBAgQECA6AMECBAg0CQgQJrYLESAAAECAkQfIECAAIEmAQHSxGYhAgQIEBAg+gABAgQINAkIkCY2CxEgQICAANEHCBAgQKBJQIA0sVmIAAECBASIPkCAAAECTQICpInNQgQIECAgQPQBAgQIEGgSECBNbBYiQIAAAQGiDxAgQIBAk4AAaWKzEAECBAgIEH2AAAECBJoEBEgTm4UIECBAQIDoAwQIECDQJCBAmtgsRIAAAQICRB8gQIAAgSYBAdLEZiECBAgQECD6AAECBAg0CQiQJjYLESBAgIAA0QcIECBAoElAgDSxWYgAAQIEBIg+QIAAAQJNAgKkic1CBAgQICBA9AECBAgQaBIQIE1sFiJAgAABAaIPECBAgECTgABpYrMQAQIECAgQfYAAAQIEmgQESBObhQgQIEBAgOgDBAgQINAkIECa2CxEgAABAgJEHyBAgACBJgEB0sRmIQIECBAQIPoAAQIECDQJCJAmNgsRIECAgADRBwgQIECgSUCANLFZiAABAgQEiD5AgAABAk0CAqSJzUIECBAgIED0AQIECBBoEhAgTWwWIkCAAAEBog8QIECAQJOAAGlisxABAgQICBB9gAABAgSaBARIE5uFCBAgQECA6AMECBAg0CQgQJrYLESAAAECAkQfIECAAIEmAQHSxGYhAgQIEBAg+gABAgQINAkIkCY2CxEgQICAANEHCBAgQKBJQIA0sVmIAAECBASIPkCAAAECTQICpInNQgQIECAgQPQBAgQIEGgSECBNbBYiQIAAAQGiDxAgQIBAk4AAaWKzEAECBAgIEH2AAAECBJoEBEgTm4UIECBAQIDoAwQIECDQJCBAmtgsRIAAAQICRB8gQIAAgSYBAdLEZiECBAgQECD6AAECBAg0CQiQJjYLESBAgIAA0QcIECBAoElAgDSxWYgAAQIEBIg+QIAAAQJNAgKkic1CBAgQICBA9AECBAgQaBIQIE1sFiJAgAABAaIPECBAgECTgABpYrMQAQIECAgQfYAAAQIEmgQESBObhQgQIEBAgOgDBAgQINAkIECa2CxEgAABAgJEHyBAgACBJgEB0sRmIQIECBAQIPoAAQIECDQJCJAmNgsRIECAgADRBwgQIECgSUCANLFZiAABAgQEiD5AgAABAk0CAqSJzUIECBAgIED0AQIECBBoEhAgTWwWIkCAAAEBog8QIECAQJOAAGlisxABAgQInESAPP7447tHH310d8cdd1y02P/+97/d3/72t93f//73zS1Yl/XJJ5/sXn755c3lXMUCP/7xj3dPPfXU7q677tr0c99+++0u/3z11Ve7zz//fPfPf/5z99FHH20q49S+XFt9+eWXuz/84Q+nVo0rWd8nn3xy9/DDD9/6rZu8DVwJiB9pFjjJAElt//Of/+zeeOON3Weffbap8iMESA2SMMkg8de//nWz1ybca/zyuQbID37wg1367A9/+MPdSy+91EVYgHRhVMhutzvZAEnrZa/61Vdf3dSQIwZIAUrovvPOO2d5NHKOAZKj7kceeWT3/e9/f9fziEqAbBoyfPmAwEkHSE5l/eUvf9n94x//WN3Ipxwg33zzze7jjz++OIV36JMBJ3us+aec9ivfz5HIa6+9tktZ5/Q5twC5zPoIkHPq+ddbl5MOkHIqK0ch2UNb8znlAMk1jZy2Swis+fzkJz/Z/fKXv9zdfffdt77eErprfuu6v3OZA+511O0y6yNArqNFz/M3Tz5A0iz//ve/d6+//vqqFhop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',
            setCurrentPage,
            deleteCurrentPage,
            currentPage,
            setIsIdleScreen,
            clearCurrentPage,
            showLocationSelectorPopup,
            setShowLocationSelectionPopup,
            setIsLoading,
            currentAuth,
            setAuth,
            deleteAuth,
            // KioskConfig,
         }}
      >
         {children}
      </ConfigContext.Provider>
   )
}

export const useConfig = (globalType = '') => {
   const {
      state,
      buildImageUrl,
      noProductImage,
      imagePlaceholder,
      isConfigLoading,
      dispatch,
      setCurrentPage,
      deleteCurrentPage,
      currentPage,
      setIsIdleScreen,
      clearCurrentPage,
      showLocationSelectorPopup,
      setShowLocationSelectionPopup,
      setIsLoading,
      currentAuth,
      setAuth,
      deleteAuth,
      // KioskConfig,
   } = React.useContext(ConfigContext)

   const hasConfig = React.useCallback(
      (identifier = '', localType = '') => {
         const type = localType || globalType
         if (isEmpty(state.settings)) return false
         if (identifier && type && has(state.settings, type)) {
            const identifierValue = state.settings[type][identifier]
            if (identifierValue) return true
            return false
         }
         return false
      },
      [state, globalType]
   )

   const configOf = React.useCallback(
      (identifier = '', localType = '') => {
         const type = localType || globalType
         if (isEmpty(state.settings)) return {}
         if (identifier && type && has(state.settings, type)) {
            return state.settings[type][identifier] || {}
         }
         return {}
      },
      [state, globalType]
   )

   // this is final availability for store like PICKUP_AVAILABLE || DINE_AVAILABLE
   const isStoreAvailable = React.useMemo(() => {
      return (
         state.kioskAvailability['ONDEMAND_PICKUP'] ||
         state.kioskAvailability['ONDEMAND_DINEIN']
      )
   }, [state.kioskAvailability])

   return {
      configOf,
      hasConfig,
      buildImageUrl,
      noProductImage,
      imagePlaceholder,
      brand: state.brand,
      settings: state.settings,
      orderTabs: state.orderTabs,
      selectedOrderTab: state.selectedOrderTab,
      kioskId: state.kioskId,
      kioskDetails: state.kioskDetails,
      locationId: state.locationId,
      isConfigLoading,
      dispatch,
      setCurrentPage,
      deleteCurrentPage,
      currentPage,
      setIsIdleScreen,
      isIdleScreen: state.isIdleScreen,
      userLocation: state.userLocation,
      storeStatus: state.storeStatus,
      clearCurrentPage,
      showLocationSelectorPopup,
      setShowLocationSelectionPopup,
      kioskRecurrences: state.kioskRecurrences,
      isStoreAvailable,
      kioskAvailability: state.kioskAvailability,
      setIsLoading,
      currentAuth,
      setAuth,
      deleteAuth,
      KioskConfig: state.KioskConfig,
      brandLocation: state.brandLocation,
   }
}
