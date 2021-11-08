import React, { useState, useEffect } from 'react'
import { List, useMultiList, ListSearch, Loader } from '@dailykit/ui'
import _ from 'lodash'
import { useSubscription } from '@apollo/react-hooks'
import styled from 'styled-components'
import { GET_FILES } from '../../../../../graphql'
import { StyledOptions } from '../styled'
import { PageModuleCard } from '../components/PageModuleCard'

const File = ({
   linkedFiles,
   emptyOptions,
   seletedModules,
   setSeletedModules,
}) => {
   const [files, setFiles] = useState([])
   const [search, setSearch] = React.useState('')
   const [list, selected, selectOption] = useMultiList(files)

   const filteredPlugnInFiles = linkedFiles.filter(file => file.fileId !== null)
   const linkedIds = filteredPlugnInFiles.map(file => file.fileId)
   // subscription query for loading the files
   const { loading, error } = useSubscription(GET_FILES, {
      variables: {
         linkedFile: linkedIds,
         fileTypes: ['html', 'liquid', 'pug', 'mustache', 'ejs'],
      },
      onSubscriptionData: ({
         subscriptionData: {
            data: { editor_file_aggregate: { nodes = [] } } = {},
         } = {},
      }) => {
         const result = nodes.map(file => {
            return {
               id: file.id,
               title: file.fileName,
               value: file.path,
               type: file.fileType,
            }
         })
         setFiles(result)
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
               .filter(option => option.title.toLowerCase().includes(search))
               .map(option => (
                  <PageModuleCard
                     key={option.id}
                     content={{
                        title: option.title,
                        description: option.value,
                     }}
                     onClick={() => selectOption('id', option.id)}
                     isActive={selected.find(item => item.id === option.id)}
                  />
               ))}
         </StyledOptions>
      </List>
   )
}
export default File

export const Wrapper = styled.div`
   width: 100%;
   li {
      margin-bottom: 8px;
      div {
         width: 100%;
         h3 {
            margin: 0;
         }
         p {
            margin: 0;
         }
      }
   }
`
