import React from 'react'
import { useMutation, useQuery, useSubscription } from '@apollo/react-hooks'
import { toast } from 'react-toastify'
import { TunnelHeader, Tunnel, Tunnels, Dropdown } from '@dailykit/ui'
import { GET_FILES, LINK_JS_FILES } from '../../../graphql'
import { TunnelBody } from './style'
// import { Context } from '../../../state'
import { useTabsInfo } from '../../../context'

export default function LinkCss({
   tunnels,
   openTunnel,
   closeTunnel,
   linkJsIds,
}) {
   const { tabInfo } = useTabsInfo()
   // const { state, dispatch } = React.useContext(Context)
   const [jsOptions, setJsOptions] = React.useState([])
   const [linkJsFiles, setLinkJsFiles] = React.useState([])
   const [searchOption, setSearchOption] = React.useState('')
   const [searchResult, setSearchResult] = React.useState([])
   const files = linkJsIds.map(file => {
      return file.jsFileId
   })
   //    console.log(files)
   const { loading, error } = useSubscription(GET_FILES, {
      variables: {
         fileType: 'js',
         linkedFiles: files,
      },
      onSubscriptionData: ({
         subscriptionData: { data: { editor_file_aggregate = [] } = {} } = {},
      }) => {
         const jsResult = editor_file_aggregate?.nodes.map(file => {
            return {
               id: file.id,
               title: file.fileName,
               value: file.path,
               type: file.fileType,
            }
         })
         console.log(jsResult)
         setJsOptions(jsResult)
         setSearchResult(jsResult)
      },
   })

   //mutation for linking js files
   const [linkJs, { loading: linkLoading }] = useMutation(LINK_JS_FILES, {
      onCompleted: () => {
         toast.success('Files linked successfully!')
         closeTunnel(1)
         setLinkJsFiles([])
      },
      onError: () => {
         toast.error('Something went wrong!!')
         setLinkJsFiles([])
      },
   })

   const onSaveHandler = () => {
      linkJs({
         variables: {
            objects: linkJsFiles,
         },
      })
   }

   const selectedOptionHandler = options => {
      const result = options.map(option => {
         return {
            guiFileId: tabInfo.id,
            jsFileId: option?.id,
         }
      })
      setLinkJsFiles(result)
   }

   React.useEffect(() => {
      const result = jsOptions.filter(option =>
         option.title.toLowerCase().includes(searchOption)
      )
      setSearchResult(result)
   }, [searchOption])

   return (
      <div>
         <Tunnels tunnels={tunnels}>
            <Tunnel layer={1}>
               <TunnelHeader
                  title="Link JS Files"
                  close={() => closeTunnel(1)}
                  right={{
                     title: linkLoading ? 'Saving' : 'Save',
                     action: onSaveHandler,
                  }}
               />
               <TunnelBody>
                  <Dropdown
                     type="multi"
                     options={searchResult}
                     searchedOption={option => setSearchOption(option)}
                     selectedOption={option => selectedOptionHandler(option)}
                     placeholder="type what you're looking for..."
                  />
               </TunnelBody>
            </Tunnel>
         </Tunnels>
      </div>
   )
}
