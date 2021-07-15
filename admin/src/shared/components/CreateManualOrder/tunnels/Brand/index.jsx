import React from 'react'
import { useQuery } from '@apollo/react-hooks'
import {
   Flex,
   List,
   ListItem,
   ListSearch,
   ListHeader,
   ListOptions,
   TunnelHeader,
   useSingleList,
} from '@dailykit/ui'

import { InlineLoader } from '../../..'
import { useManual } from '../../state'
import { QUERIES } from '../../graphql'

export const BrandTunnel = () => {
   const { tunnels } = useManual()
   const { dispatch } = useManual()
   const [search, setSearch] = React.useState('')
   const { loading, data: { brands = [] } = {} } = useQuery(QUERIES.BRAND.LIST)
   const [list, current, selectOption] = useSingleList(brands)
   return (
      <>
         <TunnelHeader
            title="Select Brand"
            close={() => tunnels.close(2)}
            right={{
               title: 'Next',
               disabled: !current?.id,
               action: () => {
                  dispatch({
                     type: 'SET_BRAND',
                     payload: {
                        id: current.id,
                        title: current.title || '',
                        domain: current?.domain || '',
                     },
                  })
                  tunnels.open(3)
               },
            }}
         />
         <Flex padding="16px" overflowY="auto" height="calc(100vh - 196px)">
            {loading ? (
               <InlineLoader />
            ) : (
               <List>
                  {Object.keys(current).length > 0 ? (
                     <ListItem
                        type="SSL2"
                        content={{
                           title: current.title,
                           description: current.description,
                        }}
                     />
                  ) : (
                     <ListSearch
                        onChange={value => setSearch(value)}
                        placeholder="type what you’re looking for..."
                     />
                  )}
                  <ListHeader type="SSL2" label="Brands" />
                  <ListOptions style={{ height: '320px', overflowY: 'auto' }}>
                     {list
                        .filter(option =>
                           option.title.toLowerCase().includes(search)
                        )
                        .map(option => (
                           <ListItem
                              type="SSL2"
                              key={option.id}
                              isActive={option.id === current.id}
                              onClick={() => selectOption('id', option.id)}
                              content={{
                                 title: option.title,
                                 description: option.domain,
                              }}
                           />
                        ))}
                  </ListOptions>
               </List>
            )}
         </Flex>
      </>
   )
}
