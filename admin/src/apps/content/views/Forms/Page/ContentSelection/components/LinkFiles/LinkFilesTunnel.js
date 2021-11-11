import React from 'react'
import { useSubscription } from '@apollo/react-hooks'
import { toast } from 'react-toastify'
import { Dropdown, Loader } from '@dailykit/ui'
import { GET_FILES } from '../../../../../../../editor/graphql'

const LinkFilesTunnel = ({ setSelectedFiles, fileType, linkedFilesId }) => {
   const [options, setOptions] = React.useState([])
   const [searchOption, setSearchOption] = React.useState('')
   const [searchResult, setSearchResult] = React.useState([])
   const { loading, error } = useSubscription(GET_FILES, {
      variables: {
         fileType: fileType,
         linkedFiles: linkedFilesId,
      },
      onSubscriptionData: ({
         subscriptionData: { data: { editor_file_aggregate = [] } = {} } = {},
      }) => {
         const result = editor_file_aggregate?.nodes.map(file => ({
            id: file.id,
            title: file.fileName,
            value: file.path,
            type: file.fileType,
         }))
         setOptions(result)
         setSearchResult(result)
      },
   })

   React.useEffect(() => {
      const result = options.filter(option =>
         option.title.toLowerCase().includes(searchOption)
      )
      setSearchResult(result)
   }, [searchOption])
   if (error) {
      toast.error('Something went wrong!')
      return <p>Something we wrong ! </p>
   }
   if (loading) return <Loader />
   return (
      <Dropdown
         type="multi"
         options={searchResult}
         searchedOption={option => setSearchOption(option)}
         selectedOption={option => setSelectedFiles(option)}
         placeholder="type what you're looking for..."
      />
   )
}

export default LinkFilesTunnel
