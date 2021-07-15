import React from 'react'
import {
   RadioGroup,
   Flex,
   Form,
   TextButton,
   Spacer,
   IconButton,
   ComboButton,
   ButtonGroup,
   useTunnel,
} from '@dailykit/ui'
import { useMutation } from '@apollo/react-hooks'
import { toast } from 'react-toastify'
import { StyledHeader, StyledMenu } from './styled'
import { logger } from '../../../../shared/utils'
import { useTabsInfo, useGlobalContext } from '../../context'
import { DRAFT_FILE } from '../../graphql'
import { useTabs } from '../../../../shared/providers'
import {
   LinkFilesTunnel,
   PagePreviewTunnel,
} from '../../views/Forms/Editor/Tunnel'

// Assets
import {
   MenuIcon,
   CodeMode,
   DesignMode,
   DesktopIcon,
   TabletIcon,
   MobileIcon,
   ExpandFullIcon,
   RotateLeftIcon,
   RotateRightIcon,
   LinkFileIcon,
   EyeIcon,
} from '../../assets/Icons'

const Header = ({ toggleSidebar }) => {
   const { tab, tabs } = useTabs()
   const [
      linkFilesTunnels,
      openLinkFilesTunnel,
      closeLinkFilesTunnel,
   ] = useTunnel(1)
   const [
      pagePreviewTunnels,
      openPagePreviewTunnel,
      closePagePreviewTunnel,
   ] = useTunnel(1)
   const { tabInfo } = useTabsInfo()
   const { globalState, addEditorInfo, updateLastSaved } = useGlobalContext()
   const [isModalVisible, setIsModalVisible] = React.useState()
   const [deviceActive, setDeviceActive] = React.useState('desktop')
   const [draftFile] = useMutation(DRAFT_FILE, {
      onCompleted: () => {
         toast.success('File Saved successfully')
      },
      onError: error => {
         toast.error('Something went wrong')
         logger(error)
      },
   })
   const ModeOptions = [
      {
         id: 1,
         title: (
            <DesignMode
               size="20"
               color={
                  globalState.editorInfo?.isDesignMode ? 'white' : '#555B6E'
               }
            />
         ),
      },
      {
         id: 2,
         title: (
            <CodeMode
               size="20"
               color={
                  globalState.editorInfo?.isDesignMode ? '#555B6E' : 'white'
               }
            />
         ),
      },
   ]

   const deviceOptions = [
      {
         id: 1,
         title: (
            <DesktopIcon
               size="20"
               color={deviceActive === 'desktop' ? 'white' : '#555B6E'}
            />
         ),
         command: 'set-device-desktop',
         name: 'desktop',
      },
      {
         id: 2,
         title: (
            <TabletIcon
               size="20"
               color={deviceActive === 'tablet' ? 'white' : '#555B6E'}
            />
         ),
         command: 'set-device-tablet',
         name: 'tablet',
      },
      {
         id: 3,
         title: (
            <MobileIcon
               size="20"
               color={deviceActive === 'mobile' ? 'white' : '#555B6E'}
            />
         ),
         command: 'set-device-mobile',
         name: 'mobile',
      },
   ]

   const result = {
      filePath: tabInfo?.filePath,
      cssPaths: tabInfo?.linkedCss.map(file => {
         return file?.cssFile?.path
      }),
      jsPaths: tabInfo?.linkedJs.map(file => {
         return file?.jsFile?.path
      }),
   }

   const undoEditor = () => {
      globalState.editorInfo.editor.focus()
      globalState.editorInfo.editor.getModel().undo()
   }
   const redoEditor = () => {
      globalState.editorInfo.editor.focus()
      globalState.editorInfo.editor.getModel().redo()
   }
   const callWebBuilderFunc = action => {
      return globalState?.editorInfo?.webBuilder.current.func(action)
   }
   const draft = () => {
      const content = globalState?.editorInfo?.editor.getValue()
      const path = tab?.path.replace(/^\/editor/g, '')
      updateLastSaved({
         path,
      })

      draftFile({
         variables: {
            path,
            content,
         },
      })
   }

   return (
      <>
         <StyledHeader>
            <StyledMenu onClick={() => toggleSidebar(visible => !visible)}>
               <MenuIcon color="#000" size="24" />
            </StyledMenu>
            {tabs.length > 0 && (
               <>
                  <Flex
                     container
                     alignItems="center"
                     justifyContent="space-between"
                  >
                     <Form.Label htmlFor="theme" title="theme">
                        Dark Theme
                     </Form.Label>
                     <Spacer size="4px" xAxis />
                     <Form.Toggle
                        name="first_time"
                        onChange={() =>
                           addEditorInfo({
                              ...globalState.editorInfo,
                              isDarkMode: !globalState?.editorInfo?.isDarkMode,
                           })
                        }
                        value={globalState?.editorInfo?.isDarkMode}
                     />
                     <Spacer size="20px" xAxis />
                     {['html', 'liquid', 'ejs', 'mustache', 'pug'].includes(
                        globalState?.editorInfo?.language
                     ) && (
                        <IconButton
                           type="ghost"
                           onClick={() => openLinkFilesTunnel(1)}
                        >
                           <LinkFileIcon size="20" />
                        </IconButton>
                     )}

                     <Spacer size="20px" xAxis />
                     <ButtonGroup>
                        <IconButton
                           type="ghost"
                           onClick={() =>
                              globalState?.editorInfo?.isDesignMode
                                 ? callWebBuilderFunc('core:undo')
                                 : undoEditor()
                           }
                        >
                           <RotateLeftIcon size="20" />
                        </IconButton>
                        <IconButton
                           type="ghost"
                           onClick={() =>
                              globalState?.editorInfo?.isDesignMode
                                 ? callWebBuilderFunc('core:redo')
                                 : redoEditor()
                           }
                        >
                           <RotateRightIcon size="20" />
                        </IconButton>
                     </ButtonGroup>
                     <Spacer size="20px" xAxis />
                     {globalState.editorInfo?.isDesignMode && (
                        <IconButton
                           type="ghost"
                           onClick={() => callWebBuilderFunc('core:fullscreen')}
                        >
                           <ExpandFullIcon size="20" />
                        </IconButton>
                     )}

                     <Spacer size="20px" xAxis />
                     {globalState?.editorInfo?.language === 'html' && (
                        <RadioGroup
                           options={ModeOptions}
                           active={globalState.editorInfo?.isDesignMode ? 1 : 2}
                           onChange={() =>
                              addEditorInfo({
                                 ...globalState.editorInfo,
                                 isDesignMode: !globalState.editorInfo
                                    ?.isDesignMode,
                              })
                           }
                        />
                     )}

                     {globalState?.editorInfo?.isDesignMode && (
                        <>
                           <Spacer size="20px" xAxis />
                           <RadioGroup
                              options={deviceOptions}
                              active={1}
                              onChange={option => {
                                 setDeviceActive(option.name)
                                 callWebBuilderFunc(option.command)
                              }}
                           />
                        </>
                     )}
                  </Flex>
                  <Flex
                     container
                     alignItems="center"
                     justifyContent="space-between"
                  >
                     {globalState.editorInfo?.isDesignMode && (
                        <>
                           <Spacer size="8px" xAxis />
                           <ComboButton
                              type="ghost"
                              onClick={() => openPagePreviewTunnel(1)}
                           >
                              <EyeIcon size="16px" />
                              PREVIEW
                           </ComboButton>
                        </>
                     )}
                     <TextButton
                        type="ghost"
                        onClick={() =>
                           globalState?.editorInfo?.isDesignMode
                              ? callWebBuilderFunc('save-template')
                              : draft()
                        }
                     >
                        SAVE
                     </TextButton>
                     <TextButton
                        type="solid"
                        onClick={() => setIsModalVisible(!isModalVisible)}
                     >
                        PUBLISH
                     </TextButton>
                  </Flex>
               </>
            )}
         </StyledHeader>
         <LinkFilesTunnel
            tunnels={linkFilesTunnels}
            openTunnel={openLinkFilesTunnel}
            closeTunnel={closeLinkFilesTunnel}
         />
         <PagePreviewTunnel
            tunnels={pagePreviewTunnels}
            openTunnel={openPagePreviewTunnel}
            closeTunnel={closePagePreviewTunnel}
            query={result}
         />
      </>
   )
}

export default Header
