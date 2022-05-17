import React, { useEffect } from 'react'

import { graphQLClient } from '../../../lib'
import Kiosk from '../../../sections/kiosk'
import { useConfig } from '../../../lib'
import {
   BRAND_LOCATIONS,
   GET_BRAND_LOCATION,
   LOCATION_KIOSK,
   LOCATION_KIOSK_VALIDATION,
} from '../../../graphql'
import { getSettings, isClient } from '../../../utils'
import { useQuery, useLazyQuery } from '@apollo/react-hooks'
import { setThemeVariable } from '../../../utils'
import { Input } from 'antd'
import KioskButton from '../../../components/kiosk/component/button'

const KioskScreen = props => {
   const { kioskId, kioskDetails, settings, brandLocationData } = props
   const { dispatch, setIsLoading } = useConfig()
   const [password, setPassword] = React.useState({
      value: '',
      isInvalid: false,
   })
   // console.log('kioskDetails', kioskDetails, brandLocationData)
   const [isValidationLoading, setIsValidationLoading] = React.useState(true)

   useEffect(() => {
      const finalKioskConfig =
         kioskDetails.kioskModuleConfig || settings.kiosk['kiosk-config']
      if (
         finalKioskConfig.kioskSettings?.primaryFont?.value?.fontEmbedLink
            ?.value
      ) {
         const fontLink =
            finalKioskConfig.kioskSettings.primaryFont.value.fontEmbedLink.value
         const linkElement = document.createElement('link')
         linkElement.rel = 'stylesheet'
         linkElement.href = fontLink
         const headTag = document.getElementsByTagName('head')[0]
         headTag.appendChild(linkElement)
         setThemeVariable(
            '--hern-primary-font',
            finalKioskConfig.kioskSettings.primaryFont.value.fontFamily.value
         )
      }
      setThemeVariable(
         '--hern-primary-color',
         finalKioskConfig.kioskSettings.theme.primaryColor.value
      )
      dispatch({
         type: 'SET_KIOSK_ID',
         payload: parseInt(kioskId),
      })
      dispatch({
         type: 'SET_KIOSK_DETAILS',
         payload: kioskDetails,
      })
      dispatch({
         type: 'SET_LOCATION_ID',
         payload: kioskDetails.locationId,
      })
      dispatch({
         type: 'SET_BRANDID',
         payload: { id: settings.brandId },
      })
      dispatch({
         type: 'SET_SETTINGS',
         payload: settings,
      })
      dispatch({
         type: 'SET_KIOSK_POPUP_CONFIG',
         payload: finalKioskConfig,
      })
      dispatch({
         type: 'SET_BRAND_LOCATION',
         payload: brandLocationData,
      })
      setIsLoading(false)
   }, [])

   const [
      validatePassword,
      { loading, data: { brands_locationKiosk = [] } = {} },
   ] = useLazyQuery(LOCATION_KIOSK_VALIDATION, {
      onCompleted: data => {
         if (data.brands_locationKiosk.length === 0) {
            setPassword(prev => ({ ...prev, isInvalid: true }))
            sessionStorage.removeItem('kiosk-ref-key')
         } else {
            const passwordInLocal = sessionStorage.getItem('kiosk-ref-key')
            if (passwordInLocal) {
               setPassword(prev => ({ ...prev, value: passwordInLocal }))
            } else {
               sessionStorage.setItem('kiosk-ref-key', password.value)
            }
         }
         setIsValidationLoading(false)
      },
   })

   React.useEffect(() => {
      const passwordInLocal = sessionStorage.getItem('kiosk-ref-key')
      if (passwordInLocal) {
         validatePassword({
            variables: {
               where: {
                  id: {
                     _eq: kioskId,
                  },
                  accessPassword: {
                     _eq: passwordInLocal,
                  },
               },
            },
         })
      } else {
         setIsValidationLoading(false)
      }
   }, [])
   useQuery(BRAND_LOCATIONS, {
      variables: {
         where: {
            brandId: { _eq: settings.brandId },
            locationId: { _eq: kioskDetails.locationId },
         },
      },
      onCompleted: data => {
         if (data) {
            dispatch({
               type: 'SET_KIOSK_RECURRENCES',
               payload:
                  data.brands_brand_location_aggregate.nodes[0]
                     .brand_recurrences,
            })
         }
      },
   })
   const handleLoginClick = () => {
      validatePassword({
         variables: {
            where: {
               id: {
                  _eq: kioskId,
               },
               accessPassword: {
                  _eq: password.value,
               },
            },
         },
      })
   }
   if (isValidationLoading) {
      return (
         <div className="hern-kiosk__login-validation">
            <span>Loading...</span>
         </div>
      )
   }
   if (brands_locationKiosk.length === 0) {
      const config =
         kioskDetails.kioskModuleConfig || settings.kiosk['kiosk-config']
      return (
         <div className="hern-kiosk__login-container">
            <div className="hern-kiosk__kiosk-info-container">
               <img
                  src={config.kioskSettings.logo.value}
                  className="hern-kiosk__kiosk-login-logo"
               />
               <span>{kioskDetails.internalLocationKioskLabel}</span>
            </div>
            <div className="hern-kiosk__login-content">
               <Input.Password
                  placeholder="Enter Password"
                  onChange={e => {
                     e.persist()
                     setPassword(prev => ({
                        ...prev,
                        value: e.target.value,
                        isInvalid: false,
                     }))
                  }}
                  onKeyPress={event => {
                     if (event.key === 'Enter') {
                        handleLoginClick()
                     }
                  }}
               />{' '}
               {password.isInvalid && (
                  <span className="hern-kiosk_error-message">
                     Incorrect Password
                  </span>
               )}
               <KioskButton
                  customClass="hern-kiosk__login-button"
                  size="large"
                  onClick={handleLoginClick}
                  buttonConfig={config?.kioskSettings?.buttonSettings}
                  disabled={loading}
               >
                  {loading ? 'Loading...' : 'Login'}
               </KioskButton>
            </div>
         </div>
      )
   }
   return (
      <div>
         <Kiosk
            kioskConfig={
               kioskDetails.kioskModuleConfig || settings.kiosk['kiosk-config']
            }
         />
      </div>
   )
}
export default KioskScreen

export async function getStaticProps({ params }) {
   const client = await graphQLClient()

   // getting kiosk details
   const kioskDetails = await client.request(LOCATION_KIOSK, { id: params.id })
   const { settings } = await getSettings(params.brand)
   // console.log('these are settings', settings)
   const { brandLocations } = await client.request(GET_BRAND_LOCATION, {
      where: {
         brandId: {
            _eq: settings.brandId,
         },
         locationId: {
            _eq: kioskDetails.brands_locationKiosk_by_pk.locationId,
         },
      },
   })

   return {
      props: {
         kioskId: params.id,
         kioskDetails: kioskDetails.brands_locationKiosk_by_pk,
         settings: settings,
         brandLocationData: brandLocations[0],
      },
      // revalidate: 60,
   }
}
export async function getStaticPaths() {
   return {
      paths: [],
      fallback: 'blocking', // true -> build page if missing, false -> serve 404
   }
}
