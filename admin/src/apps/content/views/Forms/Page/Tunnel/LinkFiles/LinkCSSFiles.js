import React from 'react'
import { useSubscription } from '@apollo/react-hooks'
import { toast } from 'react-toastify'
import { Dropdown, Loader } from '@dailykit/ui'
import { useParams } from 'react-router-dom'
import { GET_FILES } from '../../../../../../editor/graphql'

const LinkCSSFiles = ({ setSelectedCSSFiles }) => {
   const [CSSOptions, setCSSOptions] = React.useState([])
   const [searchOption, setSearchOption] = React.useState('')
   const [searchResult, setSearchResult] = React.useState([])
   const { pageId } = useParams()

   const { loading, error } = useSubscription(GET_FILES, {
      variables: {
         fileType: 'css',
         linkedFiles: [],
      },
      onSubscriptionData: ({
         subscriptionData: { data: { editor_file_aggregate = [] } = {} } = {},
      }) => {
         const CSSResult = editor_file_aggregate?.nodes.map(file => ({
            id: file.id,
            title: file.fileName,
            value: file.path,
            type: file.fileType,
         }))
         setCSSOptions(CSSResult)
         setSearchResult(CSSResult)
      },
   })

   const selectedOptionHandler = options => {
      console.log('OPTION', options)
      const cssFiles = options.map(option => ({
         fileId: option.id,
         fileType: 'css',
         pageId,
      }))
      setSelectedCSSFiles(cssFiles)
   }

   React.useEffect(() => {
      const result = CSSOptions.filter(option =>
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

export default LinkCSSFiles
