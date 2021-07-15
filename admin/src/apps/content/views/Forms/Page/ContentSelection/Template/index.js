import React, { useState } from 'react'
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
} from '@dailykit/ui'
import { GET_FILES } from '../../../../../graphql'
import { useSubscription } from '@apollo/react-hooks'

const Template = () => {
   const [templates, setTemplates] = useState([])
   const [search, setSearch] = React.useState('')
   const options = React.useMemo(
      () => [
         { id: 1, title: 'Potato' },
         { id: 2, title: 'Tomato' },
         { id: 3, title: 'Ginger' },
         { id: 4, title: 'Onion' },
      ],
      []
   )
   const [list, selected, selectOption] = useMultiList(options)
   //subscription query for loading the templates
   //    const { loading, error } = useSubscription(GET_FILES, {
   //       variables: {
   //          linkedFile: [],
   //          fileType: 'html',
   //       },
   //       onSubscriptionData: ({
   //          subscriptionData: {
   //             data: { editor_file_aggregate: { nodes = [] } } = {},
   //          } = {},
   //       }) => {
   //          const result = nodes.map(file => {
   //             return {
   //                id: file.id,
   //                title: file.fileName,
   //                value: file.path,
   //                type: file.fileType,
   //             }
   //          })
   //          console.log(nodes)
   //          setTemplates(result)
   //       },
   //    })
   return (
      <div>Templates</div>
      //   <List>
      //      <ListSearch
      //         onChange={value => setSearch(value)}
      //         placeholder="type what you’re looking for..."
      //      />
      //      {selected.length > 0 && (
      //         <TagGroup style={{ margin: '8px 0' }}>
      //            {selected.map(option => (
      //               <Tag
      //                  key={option.id}
      //                  title={option.title}
      //                  onClick={() => selectOption('id', option.id)}
      //               >
      //                  {option.title}
      //               </Tag>
      //            ))}
      //         </TagGroup>
      //      )}
      //      <ListHeader type="MSL1" label="Templates" />
      //      <ListOptions>
      //         {list
      //            .filter(option => option.title.toLowerCase().includes(search))
      //            .map(option => (
      //               <ListItem
      //                  type="MSL1"
      //                  key={option.id}
      //                  title={option.title}
      //                  onClick={() => selectOption('id', option.id)}
      //                  isActive={selected.find(item => item.id === option.id)}
      //               />
      //            ))}
      //      </ListOptions>
      //   </List>
   )
}
export default Template
