import React from 'react'
import { useQuery, useLazyQuery } from '@apollo/react-hooks'
import { Loader } from '@dailykit/ui'
import { useTabsInfo, useGlobalContext } from '../../context'
import { useTabs } from '../../../../shared/providers'
import { get_env } from '../../../../shared/utils'

// Components
import TreeView from '../TreeView'
import ContextMenu from '../ContextMenu'

// Styles
import { FileExplorerWrapper } from './styles'

// Queries
import { GET_EXPLORER_CONTENT, GET_FILE } from '../../graphql'
import { toast } from 'react-toastify'

// Helpers
import toggleNode from '../../utils/toggleNode'

const FileExplorer = () => {
   const { addTab } = useTabs()
   const { addTabInfo } = useTabsInfo()
   const { onToggleInfo } = useGlobalContext()
   const fileRef = React.useRef({})
   const [data, setData] = React.useState([])
   const nodeRef = React.useRef('')
   const [style, setStyle] = React.useState({
      top: '',
      left: '',
      display: '',
   })
   const [menuVisible, setMenuVisible] = React.useState(false)
   const {
      loading: queryLoading,
      error: queryError,
      data: queryData,
   } = useQuery(GET_EXPLORER_CONTENT, {
      variables: { path: '' },
   })

   const [getFileQuery, { loading: fileLoading }] = useLazyQuery(GET_FILE, {
      onError: error => {
         toast.error('Something went wrong file!')
         console.log(error)
      },
      onCompleted: data => {
         console.log(data)
         if (
            data &&
            data.constructor === Object &&
            Object.keys(data).length !== 0 &&
            data.editor_file.length > 0 &&
            Object.keys(fileRef.current).length !== 0
         ) {
            const payload = {
               name: fileRef.current.name,
               path: `/editor${fileRef.current.path.replace(
                  get_env('REACT_APP_ROOT_FOLDER'),
                  ''
               )}`,
               filePath: fileRef.current.path.replace(
                  get_env('REACT_APP_ROOT_FOLDER'),
                  ''
               ),
               id: data.editor_file[0].id,
               linkedCss: data.editor_file[0].linkedCssFiles,
               linkedJs: data.editor_file[0].linkedJsFiles,
            }
            addTabInfo(payload)
            addTab(payload?.name, payload?.path)
         }
      },
      fetchPolicy: 'cache-and-network',
   })

   React.useEffect(() => {
      const { getFolderWithFiles: files } = queryData || {}
      if (files) {
         setData(files.children)
      }
   }, [queryData])

   const onToggle = async node => {
      const mutated = await toggleNode(data, node)
      setData(mutated)
   }

   const onSelection = async (node, nodeIndex) => {
      if (node.type === 'folder') {
         await onToggle(node.path)
         if (data.length && data[nodeIndex] && data[nodeIndex].isOpen) {
            onToggleInfo({
               name: node.name,
               path: node.path.replace(get_env('REACT_APP_ROOT_FOLDER'), ''),
               type: node.type,
            })
         } else {
            onToggleInfo({})
         }
      }
      if (node.type === 'file') {
         fileRef.current = node
         getFileQuery({
            variables: {
               path: node.path.replace(get_env('REACT_APP_ROOT_FOLDER'), ''),
            },
         })
      }
   }

   const toggleMenu = command => {
      setStyle({ ...style, display: command === 'show' ? 'block' : 'none' })
      setMenuVisible(!menuVisible)
   }

   const clickHandler = () => {
      if (menuVisible) {
         toggleMenu('hide')
      }
   }

   const showContextMenu = (e, node, command) => {
      e.preventDefault()
      nodeRef.current = node
      setStyle({
         ...style,
         top: `${e.pageY - 20}px`,
         left: `${e.pageX}px`,
         display: command === 'show' ? 'block' : 'none',
      })
      setMenuVisible(!menuVisible)
   }

   if (queryLoading) {
      return <Loader />
   }
   if (queryError) {
      return <div>Error</div>
   }
   return (
      <FileExplorerWrapper onClick={clickHandler}>
         <TreeView
            data={data}
            onSelection={onSelection}
            onToggle={onToggle}
            showContextMenu={(e, node) => showContextMenu(e, node, 'show')}
         />
         <ContextMenu style={style} node={nodeRef.current} />
      </FileExplorerWrapper>
   )
}

export default FileExplorer
