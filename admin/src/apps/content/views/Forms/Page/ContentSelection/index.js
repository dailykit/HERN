import React, { useState, useContext } from 'react'
import {
   Flex,
   HorizontalTab,
   HorizontalTabs,
   HorizontalTabList,
   HorizontalTabPanel,
   HorizontalTabPanels,
   ComboButton,
   IconButton,
   PlusIcon,
   Text,
   Filler,
   useTunnel,
} from '@dailykit/ui'
import { useSubscription, useMutation } from '@apollo/react-hooks'
import { useParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import { DeleteIcon, EditIcon } from '../../../../../../shared/assets/icons'
import { DragNDrop, InlineLoader } from '../../../../../../shared/components'
import { useDnd } from '../../../../../../shared/components/DragNDrop/useDnd'
import { StyledWrapper, WrapDiv, Child } from './styled'
import {
   LINKED_COMPONENT,
   UPDATE_LINK_COMPONENT,
   LINK_COMPONENT,
   DELETE_LINKED_COMPONENT,
} from '../../../../graphql'
import { logger } from '../../../../../../shared/utils'
import { ConfigTunnel } from '../Tunnel'
import File from './File'
import Template from './Template'
import SystemModule from './SystemModule'
import ConfigContext from '../../../../context/Config'

const ContentSelection = () => {
   const [configTunnels, openConfigTunnel, closeConfigTunnel] = useTunnel()
   const { initiatePriority } = useDnd()
   const { pageId, pageName } = useParams()
   const [linkedFiles, setLinkedFiles] = useState([])
   const [selectedFileOptions, setSelectedFileOptions] = useState([])
   const [, setConfigContext] = useContext(ConfigContext)

   const { loading, error: subscriptionError } = useSubscription(
      LINKED_COMPONENT,
      {
         variables: {
            pageId,
         },
         onSubscriptionData: ({
            subscriptionData: {
               data: { brands_brandPageModule: pageModules = [] } = {},
            } = {},
         }) => {
            const files = pageModules
            setLinkedFiles(files)
            if (files.length) {
               initiatePriority({
                  tablename: 'brandPageModule',
                  schemaname: 'brands',
                  data: files,
               })
            }
         },
      }
   )

   // Create mutation
   const [linkComponent, { loading: isLinkingComponent }] = useMutation(
      LINK_COMPONENT,
      {
         onCompleted: () => {
            toast.success(`Added to the "${pageName}" page successfully!!`)
            setSelectedFileOptions([])
         },
         onError: error => {
            toast.error('Something went wrong')
            logger(error)
            setSelectedFileOptions([])
         },
      }
   )

   // Update mutation
   const [updateLinkComponent] = useMutation(UPDATE_LINK_COMPONENT, {
      onCompleted: () => {
         toast.success(`Updated "${pageName}" page successfully!!`)
         closeConfigTunnel(1)
      },
      onError: error => {
         toast.error('Something went wrong while updating link component')
         logger(error)
         closeConfigTunnel(1)
      },
   })

   // Mutation
   const [deleteLinkComponent] = useMutation(DELETE_LINKED_COMPONENT, {
      onCompleted: () => {
         toast.success(`Linked component successfully deleted!`)
         setSelectedFileOptions([])
      },
      onError: error => {
         toast.error('Something went wrong while deleting linked component')
         logger(error)
         setSelectedFileOptions([])
      },
   })

   // const updatetoggle = () => {
   //    const val = !toggle
   //    // if (val && !state.isCouponValid.status) {
   //    //    toast.error('Coupon should be valid!')
   //    // } else {
   //    updatePage({
   //       variables: {
   //          pageId: pageId,
   //          set: {
   //             published: val,
   //          },
   //       },
   //    })
   //    // }
   // }

   const saveHandler = () => {
      if (selectedFileOptions.length) {
         const result = selectedFileOptions.map(option => {
            if (option.type === 'system-defined') {
               return {
                  brandPageId: pageId,
                  moduleType: 'system-defined',
                  internalModuleIdentifier: option.identifier,
               }
            }
            return {
               brandPageId: pageId,
               moduleType: option.type === 'html' ? 'block' : 'file',
               fileId: option.id,
            }
         })

         linkComponent({
            variables: {
               objects: result,
            },
         })
      }
   }

   const updateHandler = (brandPageModuleId, updatedConfig) => {
      updateLinkComponent({
         variables: {
            brandPageModuleId,
            _set: {
               config: updatedConfig,
            },
         },
      })
   }

   const deleteHandler = id => {
      deleteLinkComponent({
         variables: {
            where: {
               id: { _eq: id },
            },
         },
      })
   }
   const openConfig = data => {
      setConfigContext(data)
      openConfigTunnel(1)
   }

   if (loading) {
      return <InlineLoader />
   }
   if (subscriptionError) {
      console.error(subscriptionError)
      toast.error(
         'Something went wrong in subscription query for linked components'
      )
      logger(subscriptionError)
   }
   return (
      <Flex container justifyContent="space-between">
         <WrapDiv>
            <Text as="title">Linked Components </Text>
            {linkedFiles.length ? (
               <DragNDrop
                  list={linkedFiles}
                  droppableId="linkFileDroppableId"
                  tablename="brandPageModule"
                  schemaname="brands"
               >
                  {linkedFiles.map(file => (
                     <Child key={file.id}>
                        <div className="name">
                           {file?.file?.fileName ||
                              file?.systemModule?.identifier ||
                              ''}
                           <small>({file.moduleType})</small>
                        </div>

                        {file.moduleType === 'system-defined' && (
                           <IconButton
                              type="ghost"
                              onClick={() => openConfig(file)}
                           >
                              <EditIcon color="#555b6e" size="20" />
                           </IconButton>
                        )}

                        <IconButton
                           type="ghost"
                           onClick={() => deleteHandler(file.id)}
                        >
                           <DeleteIcon color="#555b6e" size="20" />
                        </IconButton>
                     </Child>
                  ))}
               </DragNDrop>
            ) : (
               <Filler
                  message="No component linked yet!"
                  width="80%"
                  height="80%"
               />
            )}
         </WrapDiv>
         <StyledWrapper>
            <Flex container justifyContent="flex-end">
               <ComboButton
                  type="solid"
                  size="md"
                  isLoading={isLinkingComponent}
                  onClick={saveHandler}
               >
                  <PlusIcon color="#fff" /> Add
               </ComboButton>
            </Flex>
            <HorizontalTabs>
               <HorizontalTabList>
                  <HorizontalTab>Add Files</HorizontalTab>
                  <HorizontalTab>Add Templates</HorizontalTab>
                  <HorizontalTab>Add Modules</HorizontalTab>
               </HorizontalTabList>
               <HorizontalTabPanels>
                  <HorizontalTabPanel>
                     <File
                        linkedFiles={linkedFiles}
                        selectedOption={option =>
                           setSelectedFileOptions(option)
                        }
                        emptyOptions={selectedFileOptions}
                     />
                  </HorizontalTabPanel>
                  <HorizontalTabPanel>
                     <Template linkedTemplated={[]} />
                  </HorizontalTabPanel>
                  <HorizontalTabPanel>
                     <SystemModule
                        linkedFiles={linkedFiles}
                        selectedOption={option =>
                           setSelectedFileOptions(option)
                        }
                        emptyOptions={selectedFileOptions}
                     />
                  </HorizontalTabPanel>
               </HorizontalTabPanels>
            </HorizontalTabs>

            <ConfigTunnel
               tunnels={configTunnels}
               openTunnel={openConfigTunnel}
               closeTunnel={closeConfigTunnel}
               onSave={(brandPageModuleId, updatedConfig) =>
                  updateHandler(brandPageModuleId, updatedConfig)
               }
               selectedOption={selectedFileOptions}
            />
         </StyledWrapper>
      </Flex>
   )
}

export default ContentSelection
