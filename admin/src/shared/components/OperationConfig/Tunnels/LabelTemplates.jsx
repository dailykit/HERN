import React, { useState } from 'react'
import { useQuery } from '@apollo/react-hooks'
import { List, ListItem, ListSearch, Flex, ListOptions } from '@dailykit/ui'
import { LABELS } from '../../../graphql'
import { InlineLoader } from '../../InlineLoader'

export const LabelTemplatesTunnel = ({ closeTunnel, setLabelId }) => {
   const [labelID, setlabelID] = useState([])
   const [search, setSearch] = useState('')
   const selectedOption = option => {
      setLabelId(option.id)
      closeTunnel(4)
   }
   const { loading, error } = useQuery(LABELS, {
      onCompleted: data => {
         const arr = data.labelTemplates.map(datum => ({
            ...datum,
            title: datum.name,
         }))
         setlabelID([...arr])
      },
   })

   if (loading) return <InlineLoader />
   if (error) return `${error.message}`

   return (
      <Flex padding="0 16px" overflowY="auto" height="calc(100vh - 104px)">
         <List>
            <ListSearch
               onChange={value => setSearch(value)}
               placeholder="Search Label Templates..."
            />
            <ListOptions>
               {labelID
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
