import { useSubscription } from '@apollo/react-hooks'
import { ComboButton, Flex, Text } from '@dailykit/ui'
import React from 'react'
import { toast } from 'react-toastify'
import { PlusIcon } from '../../../../../shared/assets/icons'
import { Banner, InlineLoader, Tooltip } from '../../../../../shared/components'
import { logger } from '../../../../../shared/utils'
import { LOCATIONS } from '../../../graphql'
import { StyledHeader, StyledWrapper } from '../styled'

export const Locations = () => {
   const [locations, setLocations] = React.useState()
   const {
      error,
      loading: listLoading,
      data,
   } = useSubscription(LOCATIONS.LIST, {
      onSubscriptionData: data => {
         console.log('data', data)
         setLocations(data.subscriptionData.data.brands_location)
      },
   })

   if (error) {
      toast.error('Something went wrong!')
      logger(error)
   }
   if (listLoading) return <InlineLoader />
   return (
      <StyledWrapper>
         <Banner id="brands-app-Locations-listing-top" />
         <StyledHeader>
            <Flex container alignItems="center">
               <Text as="h2" style={{ marginBottom: '0px' }}>
                  Locations ({locations?.length || 0})
               </Text>
               <Tooltip identifier="locations_listing_heading" />
            </Flex>

            <ComboButton type="solid">
               <PlusIcon color="white" />
               Create Brand
            </ComboButton>
         </StyledHeader>
      </StyledWrapper>
   )
}
