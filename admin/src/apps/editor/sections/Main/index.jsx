import React from 'react'
import { Switch, Route } from 'react-router-dom'
import { useQuery } from '@apollo/react-hooks'
import { toast } from 'react-toastify'
import { Loader } from '@dailykit/ui'
import { useGlobalContext, useDailyGit } from '../../context'
import {
   FormType,
   FileType,
   CreateType,
   ThemeStore,
} from '../../components/Popup'
import { GET_NESTED_FOLDER } from '../../graphql'
import { Home, Editor } from '../../views'
import { logger, get_env } from '../../../../shared/utils'
import { MainWrapper } from './styles'

const Main = () => {
   const { globalState, setPopupInfo, setContextMenuInfo } = useGlobalContext()
   const ROOT_PATH = get_env('REACT_APP_ROOT_FOLDER')
   const mainWidth = () => {
      let width = '100%'
      if (globalState.isSidebarVisible) {
         width = `calc(${width} - 240px)`
      } else {
         width = `calc(${width})`
      }
      return width
   }

   const {
      createFile,
      createFolder,
      renameFile,
      renameFolder,
      deleteFile,
      deleteFolder,
      addBlock,
   } = useDailyGit()
   const [name, setName] = React.useState('')
   const [path, setPath] = React.useState('')
   const [object, setObject] = React.useState(null)
   const fileTypeRef = React.useRef('')

   const {
      loading,
      data: { getNestedFolders: { children: nestedFolders = [] } = {} } = {},
   } = useQuery(GET_NESTED_FOLDER, {
      variables: { path: '' },
      onError: error => {
         toast.error('Something went wrong!!')
         logger(error)
      },
      onCompleted: data => {
         console.log('DATA', data)
      },
   })

   const closePopup = () => {
      setPopupInfo({
         createTypePopup: false,
         fileTypePopup: false,
         formTypePopup: false,
      })
   }

   const setCreateType = createType => {
      const option = {
         type: createType,
         action: 'create',
         contextPath: ROOT_PATH,
      }

      if (createType === 'folder') {
         setContextMenuInfo({
            ...option,
            showPopup: {
               createTypePopup: false,
               fileTypePopup: false,
               formTypePopup: true,
               themeStorePopup: false,
            },
         })
      } else if (createType === 'file') {
         setContextMenuInfo({
            ...option,
            showPopup: {
               createTypePopup: false,
               fileTypePopup: true,
               formTypePopup: false,
               themeStorePopup: false,
            },
         })
      } else if (createType === 'template') {
         setContextMenuInfo({
            ...option,
            showPopup: {
               createTypePopup: false,
               fileTypePopup: false,
               formTypePopup: false,
               themeStorePopup: true,
            },
         })
      }
   }

   const selectFileType = type => {
      fileTypeRef.current = type
      setPopupInfo({
         createTypePopup: false,
         fileTypePopup: false,
         formTypePopup: true,
         themeStorePopup: false,
      })
   }

   const mutationHandler = async (type, nodeType) => {
      if (type === 'create') {
         if (nodeType === 'FILE') {
            const filePath = `${path.replace(ROOT_PATH, '')}/${name}.${
               fileTypeRef.current
            }`
            await createFile({
               variables: {
                  path: filePath,
                  content: `Start writing content of file here...`,
               },
            })
            fileTypeRef.current = ''
         } else {
            const folderPath = `${path.replace(ROOT_PATH, '')}/${name}`
            await createFolder({
               variables: {
                  path: folderPath,
               },
            })
         }
      } else if (type === 'rename') {
         if (nodeType === 'FILE') {
            const oldFilePath = path.replace(/.\/templates/g, '')
            const newFilePath = `${oldFilePath.replace(
               /\/([^/]*)$/g,
               ''
            )}/${name}.${oldFilePath.split('.').pop()}`
            await renameFile({
               variables: {
                  oldPath: oldFilePath,
                  newPath: newFilePath,
               },
            })
         } else {
            const oldFolderPath = path.replace(/.\/templates/g, '')
            const newFolderPath = `${oldFolderPath.replace(
               /\/([^/]*)$/g,
               ''
            )}/${name}`
            await renameFolder({
               variables: {
                  oldPath: oldFolderPath,
                  newPath: newFolderPath,
               },
            })
         }
      } else if (type === 'delete') {
         if (nodeType === 'FILE') {
            const filePath = path.replace(ROOT_PATH, '')
            await deleteFile({
               variables: {
                  path: filePath,
               },
            })
         } else {
            const folderPath = path.replace(ROOT_PATH, '')
            await deleteFolder({
               variables: {
                  path: folderPath,
               },
            })
         }
      } else if (type === 'block') {
         if (nodeType === 'FILE') {
            await addBlock({
               variables: {
                  object,
               },
            })
         }
      }
      setName('')
      closePopup()
   }

   if (loading) return <Loader />

   return (
      <MainWrapper width={mainWidth()}>
         <main>
            <Route path="/editor" component={Home} exact />
            <Route path="/editor/:path+" component={Editor} exact />

            <FileType
               show={globalState.popupInfo.fileTypePopup}
               closePopup={closePopup}
               setFileType={fileType => selectFileType(fileType)}
            />
            <FormType
               show={globalState.popupInfo.formTypePopup}
               closePopup={closePopup}
               action={globalState.contextMenuInfo.action}
               treeViewData={nestedFolders}
               nodePath={globalState?.contextMenuInfo?.contextPath || ROOT_PATH}
               nodeType={globalState.contextMenuInfo.type}
               name={name}
               setName={updatedName => setName(updatedName)}
               setPath={updatedPath => setPath(updatedPath)}
               setObject={incomingObject => {
                  console.log('Object2', incomingObject)
                  setObject(incomingObject)
               }}
               mutationHandler={(action, nodeType) =>
                  mutationHandler(action, nodeType)
               }
            />
            <CreateType
               show={globalState.popupInfo.createTypePopup}
               closePopup={closePopup}
               setCreateType={nodeType => setCreateType(nodeType)}
            />
            <ThemeStore
               show={globalState.popupInfo.themeStorePopup}
               closePopup={closePopup}
               setCreateType={nodeType => setCreateType(nodeType)}
            />
         </main>
      </MainWrapper>
   )
}

export default Main
