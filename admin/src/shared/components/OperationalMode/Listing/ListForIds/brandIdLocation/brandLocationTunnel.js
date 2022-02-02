import { useSubscription } from '@apollo/react-hooks'
import {
   Filler,
   List,
   ListHeader,
   ListItem,
   ListOptions,
   ListSearch,
   TunnelHeader,
   useSingleList,
} from '@dailykit/ui'
import React from 'react'
import { Banner, InlineLoader } from '../../../..'
import { TunnelContainer } from '../../../../../../apps/inventory/components'
import { useTabs } from '../../../../../providers'
import { BRANDS_LOCATION_ID } from '../../../Query'

const BrandLocationTunnel = ({ selectedBrand, closeTunnel }) => {
   const { tab, addTab } = useTabs()
   const [brandLocationId, setBrandLocationId] = React.useState([])
   const [search, setSearch] = React.useState('')

   const { loading, error } = useSubscription(BRANDS_LOCATION_ID, {
      variables: {
         id: selectedBrand.brandId,
      },
      onSubscriptionData: data => {
         console.log(data.subscriptionData.data.brands[0].brand_locations)
         const result =
            data.subscriptionData.data.brands[0].brand_locations.map(
               brandLocation => {
                  return {
                     id: brandLocation.locationId,
                     label: brandLocation.location.label,
                  }
               }
            )
         setBrandLocationId(result)
      },
   })
   console.log('current', brandLocationId)
   const [list, current, selectOption] = useSingleList(brandLocationId)
   const [isCreating, setIsCreating] = React.useState(false)

   return (
      <>
         <TunnelHeader
            title={
               'Select Brand Location for ' + selectedBrand.brandName + ' Brand'
            }
            close={() => closeTunnel(1)}
            nextAction="Done"
         />
         {loading ? (
            <InlineLoader />
         ) : (
            <TunnelContainer>
               <Banner id="operation-mode-brand-manager-location-tunnel-list-top" />
               {list.length ? (
                  <List>
                     {Object.keys(current).length > 0 ? (
                        <ListItem type="SSL1" title={current.label} />
                     ) : (
                        <ListSearch
                           onChange={value => setSearch(value)}
                           placeholder="type what you’re looking for..."
                        />
                     )}
                     <ListHeader type="SSL1" label="Brand Location" />
                     <ListOptions
                        search={search}
                        handleOnCreate={() => setIsCreating(true)}
                        isCreating={isCreating}
                     >
                        {list
                           .filter(option =>
                              option.label.toLowerCase().includes(search)
                           )
                           .map(option => (
                              <ListItem
                                 type="SSL1"
                                 key={option.id}
                                 title={option.label}
                                 isActive={option.id === current.id}
                                 onClick={() =>
                                    addTab(
                                       option.label,
                                       `/operationMode/${selectedBrand.brandName}-${selectedBrand.brandId}${option.id}`
                                    )
                                 }
                              />
                           ))}
                     </ListOptions>
                  </List>
               ) : (
                  <Filler message="Sorry!, No Brand Location is available" />
               )}
               <Banner id="operation-mode-brand-manager-location-tunnel-list-bottom" />
            </TunnelContainer>
         )}
      </>
   )
}

export default BrandLocationTunnel
