import React, { useEffect } from 'react'

import { graphQLClient } from '../../../lib'
import Kiosk from '../../../sections/kiosk'
import { useConfig } from '../../../lib'
import { BRAND_LOCATIONS, LOCATION_KIOSK } from '../../../graphql'
import { getSettings, isClient } from '../../../utils'
import { useQuery } from '@apollo/react-hooks'

const KioskScreen = props => {
   const { kioskId, kioskDetails, settings } = props
   const { dispatch, setIsLoading } = useConfig()

   useEffect(() => {
      dispatch({
         type: 'SET_KIOSK_ID',
         payload: kioskId,
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
      setIsLoading(false)
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
               type: 'SET_STORE_OPERATING_TIME',
               payload:
                  data.brands_brand_location_aggregate.nodes[0].operatingTime
                     .operatingTime,
            })
         }
      },
   })
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

   return {
      props: {
         kioskId: params.id,
         kioskDetails: kioskDetails.brands_locationKiosk_by_pk,
         settings: settings,
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
