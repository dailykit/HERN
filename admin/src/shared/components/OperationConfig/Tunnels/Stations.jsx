import React, { useState } from 'react'
import { useQuery } from '@apollo/react-hooks'
import { List, ListItem, ListSearch, ListOptions, Flex } from '@dailykit/ui'
import { STATIONS } from '../../../graphql'
import { InlineLoader } from '../../InlineLoader'

export const StationsTunnel = ({ closeTunnel, setStationId }) => {
   const [statID, setstatID] = useState([])
   const [search, setSearch] = useState('')
   const selectedOption = option => {
      setStationId(option.id)
      closeTunnel(3)
   }
   const { loading, error } = useQuery(STATIONS, {
      onCompleted: data => {
         const arr = data.stations.map(datum => ({
            ...datum,
            title: datum.name,
         }))
         setstatID([...arr])
      },
   })

   if (loading) return <InlineLoader />
   if (error) return `${error.message}`

   return (
      <Flex padding="0 16px" overflowY="auto" height="calc(100vh - 104px)">
         <List>
            <ListSearch
               onChange={value => setSearch(value)}
               placeholder="Search Stations..."
            />
            <ListOptions>
               {statID
                  .filter(option => option.title.toLowerCase().includes(search))
                  .map(option => (
                     <ListItem
                        type="SSL2"
                        key={option.id}
                        content={{
                           title: option.title,
                        }}
                        onClick={() => selectedOption(option)}
                     />
                  ))}
            </ListOptions>
         </List>
      </Flex>
   )
}
