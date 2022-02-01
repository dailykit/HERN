import { useSubscription } from '@apollo/react-hooks'
import { ButtonTile, Tunnel, Tunnels, useTunnel } from '@dailykit/ui'
import React from 'react'
import { InlineLoader } from '../../../../../../../shared/components'
import { Container } from '../../../../../../../shared/components/Nutrition/styled'
import { BRAND_LOCATION } from '../../../../../graphql'
import { LinkedBrandsTunnel } from '../../tunnels'

export const LinkedBrands = ({ state, locationId }) => {
   const [tunnels, openTunnel, closeTunnel] = useTunnel(1)

   const [LinkedBrands, setLinkedBrands] = React.useState({})
   //subscription
   const { loading, error } = useSubscription(BRAND_LOCATION.VIEW, {
      variables: {
         locationId: locationId,
      },
      onSubscriptionData: data => {
         console.log(
            'linkedBrands',
            data.subscriptionData.data.brands_brand_location
         )
         setLinkedBrands(data.subscriptionData.data.brands_brand_location)
      },
   })

   return (
      <>
         <Tunnels tunnels={tunnels}>
            <Tunnel layer={1} size="md">
               <LinkedBrandsTunnel
                  close={closeTunnel}
                  locationId={locationId}
               />
            </Tunnel>
         </Tunnels>
         {loading ? (
            <InlineLoader />
         ) : LinkedBrands?.length > 0 ? (
            <>Brand Linked</>
         ) : (
            <ButtonTile
               type="secondary"
               size="lg"
               text="Link Brands"
               onClick={() => openTunnel(1)}
            />
         )}
      </>
   )
}
