import React, { useState, useEffect } from 'react'
import {
   ListHeader,
   ListItem,
   List,
   ListOptions,
   useMultiList,
   ListSearch,
   TagGroup,
   Tag,
   Loader,
} from '@dailykit/ui'
import { GET_SYSTEM_MODULES } from '../../../../../graphql'
import { useSubscription } from '@apollo/react-hooks'

const SystemModule = ({ selectedOption, emptyOptions }) => {
   const [systemModules, setSystemModules] = useState([])
   const [search, setSearch] = useState('')
   const [list, selected, selectOption] = useMultiList(systemModules)
   // subscription query for loading the files
   const { loading, error } = useSubscription(GET_SYSTEM_MODULES, {
      onSubscriptionData: ({
         subscriptionData: {
            data: { brands_systemModule: systemModulesData } = [],
         } = {},
      }) => {
         const result = systemModulesData.map(file => {
            return {
               id: file.identifier,
               identifier: file.identifier,
               type: 'system-defined',
               description: file.description,
            }
         })
         setSystemModules(result)
      },
   })

   useEffect(() => {
      selectedOption(selected)
   }, [selected])

   useEffect(() => {
      if (emptyOptions.length === 0) {
         selected.splice(0, selected.length)
      }
   }, [emptyOptions])

   if (loading) {
      return <Loader />
   }
   if (error) {
      console.error(error)
   }
   return (
      <List>
         <ListSearch
            onChange={value => setSearch(value)}
            placeholder="type what you’re looking for..."
         />
         {selected.length > 0 && (
            <TagGroup style={{ margin: '8px 0' }}>
               {selected.map(option => (
                  <Tag
                     key={option.identifier}
                     title={option.identifier}
                     onClick={() =>
                        selectOption('identifier', option.identifier)
                     }
                  >
                     {option.identifier}
                  </Tag>
               ))}
            </TagGroup>
         )}
         <ListHeader type="MSL2" label="System Modules" />
         <ListOptions>
            {list
               .filter(option =>
                  option.identifier.toLowerCase().includes(search)
               )
               .map(option => (
                  <ListItem
                     type="MSL2"
                     key={option.identifier}
                     content={{
                        title: option.identifier,
                        description: option.description,
                     }}
                     onClick={() =>
                        selectOption('identifier', option.identifier)
                     }
                     isActive={selected.find(
                        item => item.identifier === option.identifier
                     )}
                  />
               ))}
         </ListOptions>
      </List>
   )
}
export default SystemModule
