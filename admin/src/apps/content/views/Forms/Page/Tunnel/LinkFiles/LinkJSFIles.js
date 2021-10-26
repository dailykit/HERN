import React from 'react'
import { useSubscription } from '@apollo/react-hooks'
import { toast } from 'react-toastify'
import { Dropdown, Loader } from '@dailykit/ui'
import { useParams } from 'react-router-dom'
import { GET_FILES } from '../../../../../../editor/graphql'

const LinkJSFiles = ({ setSelectedJSFiles }) => {
   const [JSOptions, setJSOptions] = React.useState([])
   const [searchOption, setSearchOption] = React.useState('')
   const [searchResult, setSearchResult] = React.useState([])
   const { pageId } = useParams()
   const { loading, error } = useSubscription(GET_FILES, {
      variables: {
         fileType: 'js',
         linkedFiles: [],
      },
      onSubscriptionData: ({
         subscriptionData: { data: { editor_file_aggregate = [] } = {} } = {},
      }) => {
         const JSResult = editor_file_aggregate?.nodes.map(file => ({
            id: file.id,
            title: file.fileName,
            value: file.path,
            type: file.fileType,
         }))
         setJSOptions(JSResult)
         setSearchResult(JSResult)
      },
   })
   const selectedOptionHandler = options => {
      const jsFiles = options.map(option => ({
         fileId: option.id,
         fileType: 'js',
         pageId,
      }))
      setSelectedJSFiles(jsFiles)
   }

   React.useEffect(() => {
      const result = JSOptions.filter(option =>
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
         selectedOption={option => selectedOptionHandler(option)}
         placeholder="type what you're looking for..."
      />
   )
}

export default LinkJSFiles
