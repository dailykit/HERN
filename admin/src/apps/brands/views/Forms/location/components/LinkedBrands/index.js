import { useSubscription } from '@apollo/react-hooks'
import { ButtonTile } from '@dailykit/ui'
import React from 'react'
import { InlineLoader } from '../../../../../../../shared/components'
import { Container } from '../../../../../../../shared/components/Nutrition/styled'
import { BRAND_LOCATION } from '../../../../../graphql'

export const LinkedBrands = ({ state, locationId }) => {
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
         {loading ? (
            <InlineLoader />
         ) : LinkedBrands?.length > 0 ? (
            <>Brand Linked</>
         ) : (
            <ButtonTile
               type="secondary"
               size="lg"
               text="Link Brands"
               onClick={() => console.log('linked Brands')}
            />
         )}
      </>
   )
}
