import React, { useState } from 'react'
import { useQuery } from '@apollo/react-hooks'
import { List, ListItem, ListSearch, ListOptions, Flex } from '@dailykit/ui'
import { OPERATION_CONFIG } from '../../../graphql'
import { InlineLoader } from '../../InlineLoader'
export const ConfigListTunnel = ({ closeTunnel, onSelect }) => {
   const selectedOption = option => {
      onSelect(option)
      closeTunnel(1)
   }
   const [opConfigData, setOpConfigData] = useState([])
   const [search, setSearch] = useState('')

   const { loading, error } = useQuery(OPERATION_CONFIG, {
      onCompleted: data => {
         const arr = data.settings_operationConfig.map(samp => ({
            ...samp,
            supplier: { title: samp.station.name, img: '' },
            contact: { title: samp.labelTemplate.name, img: '' },
         }))
         setOpConfigData([...arr])
      },
   })
   if (loading) return <InlineLoader />
   if (error) return `${error.message}`
   return (
      <Flex padding="0 16px" overflowY="auto" height="calc(100vh - 104px)">
         <List>
            <ListSearch
               onChange={value => setSearch(value)}
               placeholder="Search Operation Config..."
            />
            <ListOptions>
               {opConfigData
                  .filter(option =>
                     option.supplier.title.toLowerCase().includes(search)
                  )
                  .map(option => (
                     <ListItem
                        type="SSL22"
                        key={option.id}
                        content={{
                           supplier: option.supplier,
                           contact: option.contact,
                        }}
                        onClick={() => selectedOption(option)}
                     />
                  ))}
            </ListOptions>
         </List>
      </Flex>
   )
}
