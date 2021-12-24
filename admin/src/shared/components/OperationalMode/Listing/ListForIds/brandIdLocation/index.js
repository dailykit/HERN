import React from 'react'
import { BRAND_ID } from '../../../Query'
import { useSubscription } from '@apollo/react-hooks'
import {
   Filler,
   List,
   ListHeader,
   ListItem,
   ListOptions,
   ListSearch,
   Spacer,
   Tunnel,
   TunnelHeader,
   Tunnels,
   useSingleList,
   useTunnel,
} from '@dailykit/ui'
import { Banner } from '../../../..'
import { TunnelContainer } from '../../../../../../apps/inventory/components'
import BrandLocationTunnel from './brandLocationTunnel'

const BrandLocationManagerList = ({ closeTunnel }) => {
   const [brandId, setBrandId] = React.useState([])
   const [list, current, selectOption] = useSingleList(brandId)
   const [search, setSearch] = React.useState('')
   const [
      brandLocationTunnels,
      openBrandLocationTunnel,
      closeBrandLocationTunnel,
   ] = useTunnel(1)
   const [selectedBrand, setSelectedBrand] = React.useState({})
   const { loadingBrand } = useSubscription(BRAND_ID, {
      onSubscriptionData: data => {
         setBrandId(data.subscriptionData.data.brandsAggregate.nodes)
      },
   })
   const onClickFunction = option => {
      setSelectedBrand({
         brandId: option.id,
         brandName: option.title,
      })
      openBrandLocationTunnel(1)
   }
   return (
      <>
         <TunnelHeader
            title="Select Brand Name"
            close={() => closeTunnel(1)}
            nextAction="Done"
         />
         <TunnelContainer>
            <Banner id="operation-mode-brand-manager-tunnel-list-top" />
            {list.length ? (
               <List>
                  <ListSearch
                     onChange={value => setSearch(value)}
                     placeholder="type what you’re looking for..."
                  />
                  <ListHeader type="SSL1" label="Brand" />
                  <ListOptions>
                     {list
                        .filter(option =>
                           option.title.toLowerCase().includes(search)
                        )
                        .map(option => (
                           <ListItem
                              type="SSL1"
                              key={option.id}
                              title={option.title}
                              isActive={option.id === current.id}
                              onClick={() => onClickFunction(option)}
                           />
                        ))}
                  </ListOptions>
               </List>
            ) : (
               <Filler message="Sorry!, No Brand is available" />
            )}
            <Banner id="operation-mode-brand-manager-tunnel-list-bottom" />
         </TunnelContainer>
         <Tunnels tunnels={brandLocationTunnels}>
            <Tunnel popup={true} layer={4} size="md">
               <BrandLocationTunnel
                  closeTunnel={closeBrandLocationTunnel}
                  selectedBrand={selectedBrand}
               />
            </Tunnel>
         </Tunnels>
      </>
   )
}

export default BrandLocationManagerList
