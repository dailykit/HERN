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
   IconButton,
   Flex,
} from '@dailykit/ui'
import { useSubscription, useMutation } from '@apollo/react-hooks'
import { toast } from 'react-toastify'
import {
   LINK_CSS_JS_FILES,
   LINKED_CSS_JS_FILES,
   DELETE_LINKED_FILE,
} from '../../../../../../graphql'

import { DragNDrop } from '../../../../../../../../shared/components'
import {
   ChevronDown,
   ChevronRight,
   DeleteIcon,
} from '../../../../../../../../shared/assets/icons'
import { Wrapper } from './styled'
import LinkFilesTunnel from './LinkFilesTunnel'
import { Card } from 'antd'

const LinkFiles = ({ title, fileType, entityId, scope }) => {
   const [tunnels, openTunnel, closeTunnel] = useTunnel(1)
   const [selectedFiles, setSelectedFiles] = React.useState([])
   const [isOpen, setIsOpen] = React.useState(true)
   const [linkedFilesId, setLinkedFilesId] = React.useState([])

   const getWhereObj = scope => {
      switch (scope) {
         case 'brand':
            return {
               where: { brandId: { _eq: entityId } },
            }
         case 'page':
            return {
               where: { brandPageId: { _eq: entityId } },
            }
         case 'page-module':
            return {
               where: { brandPageModuleId: { _eq: entityId } },
            }
         case 'html-file':
            return {
               where: { htmlFileId: { _eq: entityId } },
            }
         default:
            return
      }
   }

   const { loading: linkLoading } = useSubscription(LINKED_CSS_JS_FILES, {
      variables: getWhereObj(scope),
      onSubscriptionData: ({
         subscriptionData: { data: { brands_jsCssFileLinks = [] } = {} } = {},
      }) => {
         const files = brands_jsCssFileLinks.filter(
            file => file.type === fileType
         )
         setSelectedFiles([...files])
      },
      skip: !entityId,
   })

   const [linkCSSJSFiles, { loading: linking }] = useMutation(
      LINK_CSS_JS_FILES,
      {
         onCompleted: () => {
            toast.success('Files linked successfully!')
            closeTunnel(1)
         },
         onError: error => {
            console.error(error)
            toast.error('Something went wrong!!')
         },
      }
   )

   const getLinkFiles = (scope, files) => {
      switch (scope) {
         case 'brand':
            return files.map(option => ({
               linkedFileId: option.id,
               type: fileType,
               brandId: entityId,
            }))
         case 'page':
            return files.map(option => ({
               linkedFileId: option.id,
               type: fileType,
               brandPageId: entityId,
            }))
         case 'page-module':
            return files.map(option => ({
               linkedFileId: option.id,
               type: fileType,
               brandPageModuleId: entityId,
            }))
         case 'html-file':
            return files.map(option => ({
               linkedFileId: option.id,
               type: fileType,
               htmlFileId: entityId,
            }))
         default:
            return
      }
   }
   const onFileSaveHandler = () => {
      linkCSSJSFiles({
         variables: {
            objects: getLinkFiles(scope, selectedFiles),
         },
      })
   }
   const [removeLinkedFile] = useMutation(DELETE_LINKED_FILE, {
      onCompleted: () => {
         toast.success('File unlinked successfully!')
      },
      onError: error => {
         toast.error('Something went wrong!')
         console.error(error)
      },
   })

   // React.useEffect(() => {
   //    const fileIds = selectedFiles.map(file => file?.file?.id)
   //    if (fileIds.length > 0) {
   //       setLinkedFilesId(fileIds)
   //    }
   // }, [selectedFiles])

   if (linkLoading) return <Loader />

   return (
      <Card
         title={<Text as="h3" style={{ color: "#555B6E" }}>{title}</Text>}
         style={{ width: '100%', marginBottom: "1rem" }}
         extra={<IconButton
            onClick={() => setIsOpen(!isOpen)}
            type="ghost"
            variant="secondary"
            size="sm"
         >
            {isOpen ? <ChevronDown color="#202020" size="26" /> : <ChevronRight color="#202020" size="24" />}
         </IconButton>}
      >
         {isOpen && (
            <Wrapper isOpen={isOpen} >
               <div style={{ padding: '0px 10px', borderBottom: '1px solid #E5E5E5' }}>

                  <Flex padding="8px">
                     {selectedFiles.length > 0 ? (
                        <DragNDrop
                           list={selectedFiles}
                           droppableId="linkWithPageDroppableId"
                           tablename="jsCssFileLinks"
                           schemaname="brands"
                        >
                           {selectedFiles.map(file => (
                              <div className="selected_file"
                                 title={file.file?.path}
                                 key={file.id}
                              >
                                 <span>{file.file?.fileName}</span>
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
                     ) : (
                        <Flex container justifyContent="center" padding="8px">
                           <Text as="subtitle">(No file linked)</Text>
                        </Flex>
                     )}
                     <div style={{ display: "flex", justifyContent: "flex-end" }}>
                        <ComboButton
                           type="ghost"
                           size="sm"
                           onClick={() => openTunnel(1)}
                        >
                           <PlusIcon color="#367BF5" />
                           Add more files
                        </ComboButton>
                     </div>
                  </Flex>

               </div>
               <Tunnels tunnels={tunnels}>
                  <Tunnel layer={1}>
                     <TunnelHeader
                        title={title}
                        close={() => closeTunnel(1)}
                        right={{
                           title: linking ? 'Saving' : 'Save',
                           action: onFileSaveHandler,
                        }}
                     />
                     <LinkFilesTunnel
                        fileType={fileType}
                        setSelectedFiles={setSelectedFiles}
                        linkedFilesId={linkedFilesId}
                     />
                  </Tunnel>
               </Tunnels>
            </Wrapper>)}
      </Card>
   )
}
export default LinkFiles
