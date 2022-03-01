import React, { useEffect } from 'react'

import { graphQLClient } from '../../../lib'
import Kiosk from '../../../sections/kiosk'
import { useConfig } from '../../../lib'
import { LOCATION_KIOSK } from '../../../graphql'
import { getSettings, isClient } from '../../../utils'

const KioskScreen = props => {
   const { kioskId, kioskDetails, settings } = props
   const { dispatch } = useConfig()

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
   }, [])
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
