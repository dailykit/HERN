import React, { useState, useEffect } from 'react'
import {
   ListHeader,
   ListItem,
   List,
   ListOptions,
   useMultiList,
   ListSearch,
   TextButton,
   TagGroup,
   Tag,
   Loader,
} from '@dailykit/ui'
import { GET_FILES } from '../../../../../graphql'
import { useSubscription } from '@apollo/react-hooks'
import styled from 'styled-components'

const File = ({ linkedFiles, selectedOption, emptyOptions }) => {
   const [files, setFiles] = useState([])
   const [search, setSearch] = React.useState('')
   let [list, selected, selectOption] = useMultiList(files)
   const linkedIds = linkedFiles.map(file => {
      return file.fileId
   })
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
      <Wrapper>
         <List>
            <ListSearch
               onChange={value => setSearch(value)}
               placeholder="type what you’re looking for..."
            />
            {selected.length > 0 && (
               <TagGroup style={{ margin: '8px 0' }}>
                  {selected.map(option => (
                     <Tag
                        key={option.id}
                        title={option.title}
                        onClick={() => selectOption('id', option.id)}
                     >
                        {option.title}
                     </Tag>
                  ))}
               </TagGroup>
            )}
            <ListHeader type="MSL2" label="Files" />
            <ListOptions>
               {list
                  .filter(option => option.title.toLowerCase().includes(search))
                  .map(option => (
                     <ListItem
                        type="MSL2"
                        key={option.id}
                        content={{
                           title: option.title,
                           description: option.value,
                        }}
                        onClick={() => selectOption('id', option.id)}
                        isActive={selected.find(item => item.id === option.id)}
                     />
                  ))}
            </ListOptions>
         </List>
      </Wrapper>
   )
}
export default File

export const Wrapper = styled.div``
