import React, { useEffect } from 'react'
import { graphQLClient } from '../../../lib'
import Kiosk from '../../../sections/kiosk'
import { useConfig } from '../../../lib'
const KioskScreen = props => {
   const { kioskId } = props
   console.log('kioskId', kioskId)
   const { dispatch } = useConfig()
   useEffect(() => {
      dispatch({
         type: 'SET_KIOSK_ID',
         payload: kioskId,
      })
   }, [])
   return (
      <div>
         <Kiosk />
      </div>
   )
}
export default KioskScreen

export async function getStaticProps({ params }) {
   //    const client = await graphQLClient()
   return {
      props: {
         kioskId: params.id,
      },
      revalidate: 60,
   }
}
export async function getStaticPaths() {
   return {
      paths: [],
      fallback: 'blocking', // true -> build page if missing, false -> serve 404
   }
}
