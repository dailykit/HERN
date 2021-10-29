import React from 'react'
import {
   Loader,
   Text,
   ComboButton,
   PlusIcon,
   useTunnel,
   Tunnels,
   Tunnel,
   TunnelHeader,
   Spacer,
   IconButton,
   Flex,
} from '@dailykit/ui'
import { useSubscription, useMutation } from '@apollo/react-hooks'
import { toast } from 'react-toastify'
import { useParams } from 'react-router-dom'
import LinkCSSFiles from './LinkCSSFiles'
import LinkJSFiles from './LinkJSFIles'
import {
   DELETE_PAGE_LINKED_FILES,
   PAGE_LINKED_FILES,
   LINK_PAGE_FILES,
} from '../../../../../graphql'
import { DragNDrop } from '../../../../../../../shared/components'
import {
   ChevronDown,
   DeleteIcon,
} from '../../../../../../../shared/assets/icons'
import { useDnd } from '../../../../../../../shared/components/DragNDrop/useDnd'
import { Wrapper } from './styled'

const Panel = () => {
   const [CSSTunnels, openCSSTunnel, closeCSSTunnel] = useTunnel(1)
   const [JSTunnels, openJSTunnel, closeJSTunnel] = useTunnel(1)
   const [selectedCSSFiles, setSelectedCSSFiles] = React.useState([])
   const [selectedJSFiles, setSelectedJSFiles] = React.useState([])

   const [isCSSPanelOpen, setIsCSSPanelOpen] = React.useState(false)
   const [isJSPanelOpen, setIsJSPanelOpen] = React.useState(false)

   const { pageId } = useParams()
   const { initiatePriority } = useDnd()

   const { loading: linkLoading } = useSubscription(PAGE_LINKED_FILES, {
      variables: {
         pageId,
      },
      onSubscriptionData: ({
         subscriptionData: { data: { brands_pagesLinkedFiles = [] } = {} } = {},
      }) => {
         const jsFiles = brands_pagesLinkedFiles.filter(
            file => file.fileType === 'js'
         )
         const cssFiles = brands_pagesLinkedFiles.filter(
            file => file.fileType === 'css'
         )
         if (cssFiles.length > 0) {
            initiatePriority({
               tablename: 'cssFileLinks',
               schemaname: 'editor',
               data: cssFiles,
            })
         }

         setSelectedCSSFiles([...cssFiles])
         setSelectedJSFiles([...jsFiles])
      },
      skip: !pageId,
   })

   const [linkFileIWithPage, { loading: linking }] = useMutation(
      LINK_PAGE_FILES,
      {
         onCompleted: () => {
            toast.success('Files linked successfully!')
            closeCSSTunnel(1)
            closeJSTunnel(1)
            setSelectedCSSFiles([])
            setSelectedJSFiles([])
         },
         onError: error => {
            console.error(error)
            toast.error('Something went wrong!!')
            setSelectedCSSFiles([])
         },
      }
   )

   const onFileSaveHandler = fileType => {
      linkFileIWithPage({
         variables: {
            objects: fileType === 'css' ? selectedCSSFiles : selectedJSFiles,
         },
      })
   }
   const [removeLinkedFile] = useMutation(DELETE_PAGE_LINKED_FILES, {
      onCompleted: () => {
         toast.success('File unlinked successfully!')
      },
      onError: error => {
         toast.error('Something went wrong!')
         console.error(error)
      },
   })

   if (linkLoading) return <Loader />

   return (
      <Wrapper>
         <Flex container alignItems="center" justifyContent="space-between">
            <Text as="text1">Link CSS Files</Text>
            <IconButton
               onClick={() => setIsCSSPanelOpen(!isCSSPanelOpen)}
               type="ghost"
               variant="secondary"
               size="sm"
            >
               <ChevronDown />
            </IconButton>
         </Flex>
         {isCSSPanelOpen && (
            <>
               <DragNDrop
                  list={selectedCSSFiles}
                  droppableId="linkWithPageDroppableId"
                  tablename="pagesLinkedFiles"
                  schemaname="brands"
               >
                  {selectedCSSFiles.map(file => (
                     <div
                        style={{
                           display: 'flex',
                           alignItems: 'center',
                           justifyContent: 'space-between',
                        }}
                        key={file.id}
                     >
                        <span>{file.linkedFile?.fileName}</span>
                        <IconButton
                           onClick={() =>
                              removeLinkedFile({
                                 variables: {
                                    id: file.id,
                                 },
                              })
                           }
                           type="ghost"
                           variant="secondary"
                           size="sm"
                        >
                           <DeleteIcon />
                        </IconButton>
                     </div>
                  ))}
               </DragNDrop>
               <ComboButton
                  type="outline"
                  size="sm"
                  onClick={() => openCSSTunnel(1)}
               >
                  <PlusIcon />
                  Add more files
               </ComboButton>
            </>
         )}
         <Spacer yAxis size="24px" />
         <Flex container alignItems="center" justifyContent="space-between">
            <Text as="text1">Link JS Files</Text>
            <IconButton
               onClick={() => setIsJSPanelOpen(!isJSPanelOpen)}
               type="ghost"
               variant="secondary"
               size="sm"
            >
               <ChevronDown />
            </IconButton>
         </Flex>
         {isJSPanelOpen && (
            <>
               <DragNDrop
                  list={selectedJSFiles}
                  droppableId="linkWithPageDroppableId"
                  tablename="pagesLinkedFiles"
                  schemaname="brands"
               >
                  {selectedJSFiles.map(file => (
                     <div
                        style={{
                           display: 'flex',
                           alignItems: 'center',
                           justifyContent: 'space-between',
                        }}
                        key={file.id}
                     >
                        <span>{file.linkedFile?.fileName}</span>
                        <IconButton
                           onClick={() =>
                              removeLinkedFile({
                                 variables: {
                                    id: file.id,
                                 },
                              })
                           }
                           type="ghost"
                           variant="secondary"
                           size="sm"
                        >
                           <DeleteIcon />
                        </IconButton>
                     </div>
                  ))}
               </DragNDrop>
               <ComboButton
                  type="outline"
                  size="sm"
                  onClick={() => openJSTunnel(1)}
               >
                  <PlusIcon />
                  Add more files
               </ComboButton>
            </>
         )}
         <Tunnels tunnels={CSSTunnels}>
            <Tunnel layer={1}>
               <TunnelHeader
                  title="Link CSS Files"
                  close={() => closeCSSTunnel(1)}
                  right={{
                     title: linking ? 'Saving' : 'Save',
                     action: () => onFileSaveHandler('css'),
                  }}
               />
               <LinkCSSFiles setSelectedCSSFiles={setSelectedCSSFiles} />
            </Tunnel>
         </Tunnels>
         <Tunnels tunnels={JSTunnels}>
            <Tunnel layer={1}>
               <TunnelHeader
                  title="Link JS Files"
                  close={() => closeJSTunnel(1)}
                  right={{
                     title: linking ? 'Saving' : 'Save',
                     action: onFileSaveHandler,
                  }}
               />
               <LinkJSFiles setSelectedJSFiles={setSelectedJSFiles} />
            </Tunnel>
         </Tunnels>
      </Wrapper>
   )
}
export default Panel
