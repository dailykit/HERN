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
import isEmpty from 'lodash/isEmpty'
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
   const [configs, setConfigs] = useState([])
   const [seletedModules, setSeletedModules] = useState([])
   const [isChangeSaved, setIsSavedChange] = useState(true)
   const [mode, setMode] = useState('editing')
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
      console.log('updatedHandler', updatedConfig)
      const keyName =
         updatedConfig.identifier === 'Animation' ? 'animationConfig' : 'config'
      updateLinkComponent({
         variables: {
            brandPageModuleId: linkedModuleId,
            _set: {
               [keyName]: updatedConfig.config,
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
      const initialAnimationConfig = {
         animation: {
            delay: {
               label: 'Animation Delay',
               value: '100',
               default: 0,
               dataType: 'number',
               isRequired: true,
               description:
                  'How long to delay the animation for (in milliseconds) once it enters or leaves the view.',
               userInsertType: 'numberField',
            },
            duration: {
               label: 'Animation Duration',
               value: '600',
               default: 1,
               dataType: 'number',
               isRequired: true,
               description: 'Animation duration in seconds.',
               userInsertType: 'numberField',
            },
            animateIn: {
               label: 'Enter Animation Style Name',
               value: {
                  id: 'fadeIn-30',
                  title: 'fadeIn',
                  value: 'animate__fadeIn',
               },
               default: {
                  id: 'fadeIn-30',
                  name: 'fadeIn',
                  value: 'animate__fadeIn',
               },
               dataType: 'select',
               isRequired: 'false',
               description: 'This sets your animation of the page entering.',
               userInsertType: 'animationSelector',
            },
            animateOut: {
               label: 'Exit Animation Style Name',
               value: {
                  id: 'fadeOut-43',
                  title: 'fadeOut',
                  value: 'animate__fadeOut',
               },
               default: {
                  id: 'fadeOut-43',
                  name: 'fadeOut',
                  value: 'animate__fadeOut',
               },
               dataType: 'select',
               isRequired: 'false',
               description: 'This sets your animation of the page exiting.',
               userInsertType: 'animationSelector',
            },
            animateOnce: {
               label: 'Animate Once',
               value: true,
               default: false,
               dataType: 'boolean',
               isRequired: true,
               description:
                  'Whether the element should only animate once or not.',
               userInsertType: 'toggle',
            },
            animatePreScroll: {
               label: 'Animate PreScroll',
               value: true,
               default: true,
               dataType: 'boolean',
               isRequired: true,
               description:
                  "By default if a ScrollAnimation is in view as soon as a page loads, then the animation will begin. If you don't want the animation to being until the user scrolls, then set this to false.",
               userInsertType: 'toggle',
            },
            initiallyVisible: {
               label: 'Animation Initial Visibility',
               value: true,
               default: false,
               dataType: 'boolean',
               isRequired: true,
               description:
                  'Whether the element should be visible to begin with or not.',
               userInsertType: 'toggle',
            },
            isAnimationRequired: {
               label: 'Animation Required',
               value: true,
               default: true,
               dataType: 'boolean',
               isRequired: true,
               description: 'Whether the animation effect required or not.',
               userInsertType: 'toggle',
            },
         },
      }
      if (!isEmpty(data.config) && !isEmpty(data.animationConfig)) {
         setConfigs([
            {
               identifier: data?.internalModuleIdentifier,
               conf: data?.config,
            },
            {
               identifier: 'Animation',
               conf: data?.animationConfig,
            },
         ])
      } else if (!isEmpty(data.config)) {
         updateLinkComponent({
            variables: {
               brandPageModuleId: data.id,
               _set: {
                  animationConfig: initialAnimationConfig,
               },
            },
         })
         setConfigs([
            {
               identifier: data?.internalModuleIdentifier,
               conf: data?.config,
            },
            {
               identifier: 'Animation',
               conf: initialAnimationConfig,
            },
         ])
      } else if (
         isEmpty(data.config) &&
         !isEmpty(data?.systemModule?.configTemplate)
      ) {
         updateLinkComponent({
            variables: {
               brandPageModuleId: data.id,
               _set: {
                  config: data?.systemModule?.configTemplate,
                  ...(!data?.animationConfig && {
                     animationConfig: initialAnimationConfig,
                  }),
               },
            },
         })
         setConfigs([
            {
               identifier: data?.systemModule?.identifier,
               conf: data?.systemModule?.configTemplate,
            },
            ...(data?.animationConfig
               ? {
                    identifier: 'Animation',
                    conf: data?.animationConfig,
                 }
               : {
                    identifier: 'Animation',
                    conf: initialAnimationConfig,
                 }),
         ])
      } else if (data.animationConfig) {
         setConfigs([
            {
               identifier: 'Animation',
               conf: data?.animationConfig,
            },
         ])
      } else {
         updateLinkComponent({
            variables: {
               brandPageModuleId: data.id,
               _set: {
                  animationConfig: initialAnimationConfig,
               },
            },
         })
         setConfigs([
            {
               identifier: 'Animation',
               conf: initialAnimationConfig,
            },
         ])
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

                        <IconButton
                           type="ghost"
                           onClick={() => openConfig(file)}
                        >
                           <EditIcon
                              color={
                                 linkedModuleId == file.id
                                    ? '#367bf5'
                                    : '#555b6e'
                              }
                              size="20"
                           />
                        </IconButton>

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
                  {configs.map(config => (
                     <ConfigTemplateUI
                        config={config.conf}
                        identifier={config.identifier}
                        configSaveHandler={updatedConfig => {
                           updateHandler({
                              identifier: config.identifier,
                              config: updatedConfig,
                           })
                        }}
                        isChangeSaved={isChangeSaved}
                        setIsSavedChange={setIsSavedChange}
                        noneditMode={'noneditMode'}
                        setLinkedModuleId={setLinkedModuleId}
                        mode={mode}
                        setMode={setMode}
                     />
                  ))}
                  <Styles.LinkWrapper>
                     <LinkFiles
                        title="Linked CSS file"
                        fileType="css"
                        entityId={linkedModuleId}
                        scope="page-module"
                     />
                     <LinkFiles
                        title="Linked JS file"
                        fileType="js"
                        entityId={linkedModuleId}
                        scope="page-module"
                     />
                  </Styles.LinkWrapper>
               </>
            ) : (
               <Styles.LinkWrapper>
                  <LinkFiles
                     title="Linked CSS file"
                     fileType="css"
                     entityId={pageId}
                     scope="page"
                  />
                  <LinkFiles
                     title="Linked JS file"
                     fileType="js"
                     entityId={pageId}
                     scope="page"
                  />
               </Styles.LinkWrapper>
            )}
         </Styles.ConfigWrapper>
      </Styles.Wrapper>
   )
}

export default ContentSelection
