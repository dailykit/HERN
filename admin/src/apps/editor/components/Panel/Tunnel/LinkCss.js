import React from 'react'
import { useMutation, useQuery, useSubscription } from '@apollo/react-hooks'
import { toast } from 'react-toastify'
import { TunnelHeader, Tunnel, Tunnels, Dropdown } from '@dailykit/ui'
import { GET_FILES, LINK_CSS_FILES } from '../../../graphql'
import { TunnelBody } from './style'
// import { Context } from '../../../state'
import { useTabsInfo } from '../../../context'

export default function LinkCss({
   tunnels,
   openTunnel,
   closeTunnel,
   linkCssIds,
}) {
   const { tabInfo } = useTabsInfo()
   // const { state, dispatch } = React.useContext(Context)
   const [cssOptions, setCssOptions] = React.useState([])
   const [linkCssFiles, setLinkCssFiles] = React.useState([])
   const [searchOption, setSearchOption] = React.useState('')
   const [searchResult, setSearchResult] = React.useState([])
   const files = linkCssIds.map(file => {
      return file.cssFileId
   })

   // query for loading css files in dropdown
   const { loading, error } = useSubscription(GET_FILES, {
      variables: {
         fileType: 'css',
         linkedFiles: files,
      },
      onSubscriptionData: ({
         subscriptionData: {
            data: { editor_file_aggregate: { nodes = [] } = {} } = {},
         } = {},
      }) => {
         const cssResult = nodes.map(file => {
            return {
               id: file.id,
               title: file.fileName,
               value: file.path,
               type: file.fileType,
            }
         })
         setCssOptions(cssResult)
         setSearchResult(cssResult)
      },
      //   skip: files.length === 0,
   })

   //mutation for linking css files
   const [linkCss, { loading: linkLoading }] = useMutation(LINK_CSS_FILES, {
      onCompleted: () => {
         toast.success('Files linked successfully!')
         closeTunnel(1)
         setLinkCssFiles([])
      },
      onError: () => {
         toast.error('Something went wrong!!')
         setLinkCssFiles([])
      },
   })

   const onSaveHandler = () => {
      linkCss({
         variables: {
            objects: linkCssFiles,
         },
      })
   }

   const selectedOptionHandler = options => {
      const result = options.map(option => {
         return {
            guiFileId: tabInfo.id,
            cssFileId: option?.id,
         }
      })
      setLinkCssFiles(result)
   }

   React.useEffect(() => {
      const result = cssOptions.filter(option =>
         option.title.toLowerCase().includes(searchOption)
      )
      setSearchResult(result)
   }, [searchOption])

   return (
      <div>
         <Tunnels tunnels={tunnels}>
            <Tunnel layer={1}>
               <TunnelHeader
                  title="Link CSS Files"
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
