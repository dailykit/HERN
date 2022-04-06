import React from 'react'
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
import { BRAND_LISTING } from '../../graphql'
import { Banner, InlineLoader } from '../../../../shared/components'
import { TunnelContainer } from '../../../inventory/components'
import { useTabs } from '../../../../shared/providers'

const BrandListing = ({ closeTunnel }) => {
   const [brandList, setBrandList] = React.useState([])
   const { tab, addTab } = useTabs()

   //subscription
   const { loading, error } = useSubscription(BRAND_LISTING, {
      onSubscriptionData: data => {
         setBrandList(data.subscriptionData.data.brands)
      },
   })
   // console.log('brand ID:::', brandList)

   //ssl1 declaration
   const [list, current, selectOption] = useSingleList(brandList)
   const [search, setSearch] = React.useState('')

   return (
      <>
         <TunnelHeader
            title="Select Brand for Customer Details"
            close={() => closeTunnel(1)}
            nextAction="Done"
         />
         {loading ? (
            <InlineLoader />
         ) : (
            <TunnelContainer>
               <Banner id="brand-tunnel-list-top" />
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
                                 onClick={() =>
                                    addTab('Customers', '/crm/customers')
                                 }
                              />
                           ))}
                     </ListOptions>
                  </List>
               ) : (
                  <Filler message="Sorry!, No Brand is available" />
               )}
               <Banner id="brand-tunnel-list-bottom" />
            </TunnelContainer>
         )}
      </>
   )
}

export default BrandListing
