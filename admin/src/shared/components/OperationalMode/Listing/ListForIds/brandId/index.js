import React from 'react'
import { Select } from 'antd'

import { useSubscription } from '@apollo/react-hooks'
import { BRAND_ID } from '../../../Query'
import { useTabs } from '../../../../../providers'
import { useHistory } from 'react-router-dom'
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
import { Banner } from '../../../..'
import { TunnelContainer } from '../../../../../../apps/inventory/components'

const BrandManagerList = ({ closeTunnel }) => {
   const [brandId, setBrandId] = React.useState([])
   const history = useHistory()

   const { loading } = useSubscription(BRAND_ID, {
      onSubscriptionData: data => {
         setBrandId(data.subscriptionData.data.brandsAggregate.nodes)
      },
   })
   console.log('brand ID:::', brandId)
   const [list, current, selectOption] = useSingleList(brandId)
   const [search, setSearch] = React.useState('')

   return (
      <>
         <TunnelHeader
            title="Select Brand"
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
                              onClick={() =>
                                 history.push({
                                    pathname: `/operationMode/brand-${option.id}`,
                                    state: [
                                       {
                                          brandId: option.id,
                                          brandName: option.title,
                                       },
                                    ],
                                 })
                              }
                           />
                        ))}
                  </ListOptions>
               </List>
            ) : (
               <Filler message="Sorry!, No Brand is available" />
            )}
            <Banner id="operation-mode-brand-manager-tunnel-list-bottom" />
         </TunnelContainer>
      </>
   )
}

export default BrandManagerList
