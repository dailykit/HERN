import React, { useState } from 'react'
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
} from '@dailykit/ui'
import { useSubscription, useMutation } from '@apollo/react-hooks'
import { useParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import { DeleteIcon, EditIcon } from '../../../../../../shared/assets/icons'
import { DragNDrop, InlineLoader } from '../../../../../../shared/components'
import { useDnd } from '../../../../../../shared/components/DragNDrop/useDnd'
import { Child, Styles, StyledHorizontalTabPanel } from './styled'
import {
   LINKED_COMPONENT,
   UPDATE_LINK_COMPONENT,
   LINK_COMPONENT,
   DELETE_LINKED_COMPONENT,
} from '../../../../graphql'
import { logger } from '../../../../../../shared/utils'
import File from './File'
import Template from './Template'
import SystemModule from './SystemModule'
import ConfigTemplateUI from '../../../../../../shared/components/ConfigTemplateUI'
import LinkFiles from './components/LinkFiles'

const ContentSelection = () => {
   const { initiatePriority } = useDnd()
   const { pageId, pageName } = useParams()
   const [linkedFiles, setLinkedFiles] = useState([])
   const [linkedModuleId, setLinkedModuleId] = useState(null)
   const [config, setConfig] = useState({})
   const [seletedModules, setSeletedModules] = useState([])
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
            setSeletedModules([])
         },
         onError: error => {
            toast.error('Something went wrong')
            logger(error)
            setSeletedModules([])
         },
      }
   )

   // Update mutation
   const [updateLinkComponent] = useMutation(UPDATE_LINK_COMPONENT, {
      onCompleted: () => {
         toast.success(`Updated "${pageName}" page successfully!!`)
      },
      onError: error => {
         toast.error('Something went wrong while updating link component')
         console.error(error)
         logger(error)
      },
   })

   // Mutation
   const [deleteLinkComponent] = useMutation(DELETE_LINKED_COMPONENT, {
      onCompleted: () => {
         toast.success(`Linked component successfully deleted!`)
         setSeletedModules([])
      },
      onError: error => {
         toast.error('Something went wrong while deleting linked component')
         logger(error)
         setSeletedModules([])
      },
   })

   const saveHandler = () => {
      if (seletedModules.length) {
         const result = seletedModules.map(option => {
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

   const updateHandler = updatedConfig => {
      updateLinkComponent({
         variables: {
            brandPageModuleId: linkedModuleId,
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
      setLinkedModuleId(prev => (data.id === prev ? null : data.id))
      if (data.config === null && data?.systemModule?.configTemplate !== null) {
         updateLinkComponent({
            variables: {
               brandPageModuleId: data.id,
               _set: {
                  config: data?.systemModule?.configTemplate,
               },
            },
         })
         setConfig(data?.systemModule?.configTemplate)
      } else {
         setConfig(data.config)
      }
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
      <Styles.Wrapper>
         <Styles.ModulesWrapper>
            <Flex container padding="16px 8px" justifyContent="space-between">
               <Text as="text1">Page Modules</Text>
               <ComboButton
                  type="solid"
                  size="sm"
                  isLoading={isLinkingComponent}
                  onClick={saveHandler}
                  disabled={!seletedModules.length}
               >
                  <PlusIcon color="#fff" /> Add
               </ComboButton>
            </Flex>

            <Styles.Tabs>
               <HorizontalTabs>
                  <HorizontalTabList>
                     <HorizontalTab>Files</HorizontalTab>
                     <HorizontalTab>Modules</HorizontalTab>
                     <HorizontalTab>Templates</HorizontalTab>
                  </HorizontalTabList>
                  <HorizontalTabPanels>
                     <StyledHorizontalTabPanel>
                        <File
                           linkedFiles={linkedFiles}
                           seletedModules={seletedModules}
                           setSeletedModules={setSeletedModules}
                           emptyOptions={seletedModules}
                        />
                     </StyledHorizontalTabPanel>
                     <StyledHorizontalTabPanel>
                        <SystemModule
                           seletedModules={seletedModules}
                           setSeletedModules={setSeletedModules}
                           emptyOptions={seletedModules}
                        />
                     </StyledHorizontalTabPanel>
                     <HorizontalTabPanel>
                        <Template linkedTemplated={[]} />
                     </HorizontalTabPanel>
                  </HorizontalTabPanels>
               </HorizontalTabs>
            </Styles.Tabs>
         </Styles.ModulesWrapper>
         <Styles.PreviewWrapper>
            <Flex padding="0 8px 16px 8px">
               <Text as="h3">
                  Selected Components
                  {linkedFiles.length > 0 && (
                     <span>({linkedFiles.length})</span>
                  )}
               </Text>
            </Flex>
            {linkedFiles.length ? (
               <DragNDrop
                  list={linkedFiles}
                  droppableId="linkFileDroppableId"
                  tablename="brandPageModule"
                  schemaname="brands"
               >
                  {linkedFiles.map(file => (
                     <Child isActive={linkedModuleId === file.id} key={file.id}>
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
         </Styles.PreviewWrapper>
         <Styles.ConfigWrapper>
            {linkedModuleId ? (
               <>
                  <ConfigTemplateUI
                     config={config}
                     setConfig={setConfig}
                     configSaveHandler={updateHandler}
                  />
                  <LinkFiles
                     title="Linked CSS file with this Module"
                     fileType="css"
                     entityId={linkedModuleId}
                     scope="page-module"
                  />
                  <LinkFiles
                     title="Linked JS file with this Module"
                     fileType="js"
                     entityId={linkedModuleId}
                     scope="page-module"
                  />
               </>
            ) : (
               <>
                  <LinkFiles
                     title="Linked CSS file with this Page"
                     fileType="css"
                     entityId={pageId}
                     scope="page"
                  />
                  <LinkFiles
                     title="Linked JS file with this Page"
                     fileType="js"
                     entityId={pageId}
                     scope="page"
                  />
               </>
            )}
         </Styles.ConfigWrapper>
      </Styles.Wrapper>
   )
}

export default ContentSelection
