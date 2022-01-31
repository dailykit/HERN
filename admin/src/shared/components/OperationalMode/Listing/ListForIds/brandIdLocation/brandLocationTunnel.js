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
import { Banner } from '../../../..'
import { TunnelContainer } from '../../../../../../apps/inventory/components'
import { useTabs } from '../../../../../providers'
import { BRANDS_LOCATION_ID } from '../../../Query'

const BrandLocationTunnel = ({ selectedBrand, closeTunnel }) => {
   const { tab, addTab } = useTabs()
   const [brandLocationId, setBrandLocationId] = React.useState([])
   const [list, current, selectOption] = useSingleList(brandLocationId)
   const [search, setSearch] = React.useState('')
   const { loading } = useSubscription(BRANDS_LOCATION_ID, {
      variables: {
         where: {
            id: {
               _eq: selectedBrand.brandId,
            },
         },
      },
      onSubscriptionData: data => {
         setBrandLocationId(
            data.subscriptionData.data.brandsAggregate.nodes[0].brand_locations
         )
      },
   })
   return (
      <>
         <TunnelHeader
            title={
               'Select Brand Location for ' + selectedBrand.brandName + ' Brand'
            }
            close={() => closeTunnel(1)}
            nextAction="Done"
         />
         <TunnelContainer>
            <Banner id="operation-mode-brand-manager-location-tunnel-list-top" />
            {list.length ? (
               <List>
                  <ListSearch
                     onChange={value => setSearch(value)}
                     placeholder="type what you’re looking for..."
                  />
                  <ListHeader type="SSL1" label="Brand Location" />
                  <ListOptions>
                     {list
                        .filter(option =>
                           String(option.id).toLowerCase().includes(search)
                        )
                        .map(option => (
                           <ListItem
                              type="SSL1"
                              key={option.id}
                              title={String(option.id)}
                              isActive={option.id === current.id}
                              onClick={() =>
                                 addTab(
                                    `${option.id}`,
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
      </>
   )
}

export default BrandLocationTunnel
