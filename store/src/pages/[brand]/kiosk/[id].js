import React from 'react'
import { graphQLClient } from '../../../lib'
import Kiosk from '../../../sections/kiosk'
const KioskScreen = props => {
   const { kioskId } = props
   console.log('kioskId', kioskId)
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
