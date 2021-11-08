import React, { useState, useEffect } from 'react'
import { List, useMultiList, ListSearch, Loader } from '@dailykit/ui'
import { useSubscription } from '@apollo/react-hooks'
import _ from 'lodash'
import { GET_SYSTEM_MODULES } from '../../../../../graphql'
import { StyledOptions } from '../styled'
import { PageModuleCard } from '../components/PageModuleCard'

const SystemModule = ({ emptyOptions, seletedModules, setSeletedModules }) => {
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
      const modules = _.unionWith(selected, seletedModules, _.isEqual)
      setSeletedModules(modules)
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
         <StyledOptions>
            {list
               .filter(option =>
                  option.identifier.toLowerCase().includes(search)
               )
               .map(option => (
                  <PageModuleCard
                     key={option.identifier}
                     onClick={() =>
                        selectOption('identifier', option.identifier)
                     }
                     isActive={selected.find(
                        item => item.identifier === option.identifier
                     )}
                     content={{
                        title: option.identifier,
                        description: option.description,
                     }}
                  />
               ))}
         </StyledOptions>
      </List>
   )
}
export default SystemModule
