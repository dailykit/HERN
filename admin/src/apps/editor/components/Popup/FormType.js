import React from 'react'
import {
   Flex,
   Spacer,
   TextButton,
   Form,
   Loader,
   ButtonGroup,
   IconButton,
} from '@dailykit/ui'
import { Popup, AssetUploader } from '../../../../shared/components'
import { get_env } from '../../../../shared/utils'
import { TreeSelect } from 'antd'
import 'antd/dist/antd.css'
import { useQuery } from '@apollo/react-hooks'
import { GET_FILE_ID } from '../../graphql'
import { EditIcon, DeleteIcon } from '../../assets/Icons'

export default function FormType({
   show,
   closePopup,
   action,
   nodeType,
   setName,
   mutationHandler,
   name,
   treeViewData,
   nodePath,
   setPath,
   setObject,
}) {
   //Make it as a block states
   const [blockName, setBlockName] = React.useState('')
   const [pathName, setPathName] = React.useState('')
   const [category, setCategory] = React.useState('')
   const [fileId, setFileId] = React.useState(null)
   const [iconUrl, setIconUrl] = React.useState('')
   //
   const [selected, setSelected] = React.useState(null)
   const [treeViewNodes, setTreeViewNodes] = React.useState([])
   const [active, setActive] = React.useState(false)
   const nodePathRef = React.useRef('')
   const { loading: isIdLoading } = useQuery(GET_FILE_ID, {
      skip: !pathName,
      variables: {
         where: {
            path: {
               _eq: pathName,
            },
         },
      },
      onCompleted: ({ editor_file = [] } = {}) => {
         if (editor_file.length > 0) setFileId(editor_file[0]?.id)
      },
   })
   const onChange = value => {
      setSelected(value)
      setPath(value)
   }
   const cancelPopupHandler = () => {
      nodePathRef.current = ''
      closePopup()
   }
   const mutationFunc = () => {
      mutationHandler(action, nodeType.toUpperCase())
      nodePathRef.current = ''
   }

   const stopDot = e => {
      if (e.keyCode === 190 || e.keyCode === 110) {
         e.preventDefault()
      }
   }
   React.useEffect(() => {
      setObject({
         name: blockName,
         path: pathName,
         assets: {
            icon: iconUrl,
         },
         category,
         fileId,
      })
   }, [blockName, pathName, iconUrl, category, fileId])

   React.useEffect(() => {
      if (treeViewData !== undefined) {
         const result = [
            {
               title: 'Root',
               value: get_env('REACT_APP_ROOT_FOLDER'),
            },
            ...treeViewData,
         ]
         setTreeViewNodes(result)
      }
   }, [treeViewData])
   React.useEffect(() => {
      if (nodePath || nodePathRef.current) {
         nodePathRef.current = nodePath
         setSelected(nodePathRef.current)
         setPath(nodePathRef.current)
         const updatePathName = nodePathRef.current.replace(
            get_env('REACT_APP_ROOT_FOLDER'),
            ''
         )
         console.log(nodePathRef)
         setPathName(updatePathName)
      }
   }, [nodePath, nodePathRef.current])

   if (isIdLoading) {
      return <Loader />
   }

   return (
      <Popup show={show} size="460px">
         {action !== 'delete' && action !== 'block' ? (
            action === 'create' ? (
               <>
                  <Flex>
                     <Form.Group>
                        <Form.Label htmlFor="name" title="name">
                           Enter {nodeType} Name
                        </Form.Label>
                        <Form.Text
                           id="name"
                           name="name"
                           onChange={e => setName(e.target.value)}
                           value={name}
                           onKeyDown={e => stopDot(e)}
                        />
                        <Spacer size="16px" />
                        <Form.Label>Select the folder to keep it</Form.Label>
                        <TreeSelect
                           showSearch
                           style={{ width: '100%' }}
                           value={selected}
                           dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
                           placeholder="Please select"
                           allowClear
                           onChange={onChange}
                           treeData={treeViewNodes}
                        />
                     </Form.Group>
                  </Flex>
                  <Spacer size="16px" />
                  <Flex container justifyContent="flex-end">
                     <ButtonGroup>
                        <TextButton type="solid" onClick={mutationFunc}>
                           Create
                        </TextButton>
                        <TextButton type="ghost" onClick={cancelPopupHandler}>
                           Cancel
                        </TextButton>
                     </ButtonGroup>
                  </Flex>
               </>
            ) : (
               <>
                  <Form.Group>
                     <Form.Label htmlFor="name" title="name">
                        Rename {nodeType}
                     </Form.Label>
                     <Form.Text
                        id="name"
                        name="name"
                        onChange={e => setName(e.target.value)}
                        value={name}
                        onKeyDown={e => stopDot(e)}
                     />
                     <Spacer size="16px" />
                     <Form.Label>Select the folder to keep it</Form.Label>
                     <TreeSelect
                        showSearch
                        style={{ width: '100%' }}
                        value={selected}
                        dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
                        placeholder="Please select"
                        allowClear
                        onChange={onChange}
                        treeData={treeViewNodes}
                     />
                  </Form.Group>
                  <Spacer size="16px" />
                  <Flex container justifyContent="flex-end">
                     <ButtonGroup>
                        <TextButton type="solid" onClick={mutationFunc}>
                           Rename
                        </TextButton>
                        <TextButton type="ghost" onClick={cancelPopupHandler}>
                           Cancel
                        </TextButton>
                     </ButtonGroup>
                  </Flex>
               </>
            )
         ) : action === 'delete' ? (
            <>
               <Popup.Text type="danger">
                  Are you sure you want to delete this {nodeType}!
               </Popup.Text>
               <Flex container justifyContent="flex-end">
                  <ButtonGroup>
                     <TextButton type="solid" onClick={mutationFunc}>
                        Yes! delete this {nodeType}
                     </TextButton>
                     <TextButton type="ghost" onClick={cancelPopupHandler}>
                        Cancel
                     </TextButton>
                  </ButtonGroup>
               </Flex>
            </>
         ) : (
            // state: blockName,
            <>
               <Form.Group>
                  <Form.Label htmlFor="name" title="name">
                     Block Details {nodeType}
                  </Form.Label>
                  <Form.Text
                     id="name"
                     name="name"
                     placeholder="Name"
                     onChange={e => setBlockName(e.target.value)}
                     value={blockName}
                  />
                  <Spacer size="16px" />
                  <Form.Text
                     id="path"
                     name="path"
                     placeholder="Path"
                     onChange={e => setPathName(e.target.value)}
                     value={pathName}
                     disabled
                  />
                  <Spacer size="16px" />
                  <Form.Text
                     id="category"
                     name="category"
                     placeholder="Category"
                     onChange={e => setCategory(e.target.value)}
                     value={category}
                  />
                  <Spacer size="16px" />
                  <Form.Text
                     id="fileId"
                     name="fileId"
                     placeholder="FileId"
                     onChange={e => setFileId(e.target.value)}
                     value={fileId}
                     disabled
                  />
                  <Spacer size="16px" />
                  {iconUrl ? (
                     <div
                        style={{
                           display: 'flex',
                           justifyContent: 'center',
                           alignItems: 'center',
                        }}
                     >
                        <div>
                           <img
                              style={{ height: '50px', width: '50px' }}
                              src={iconUrl}
                           ></img>
                        </div>
                        <div>
                           <ButtonGroup>
                              <IconButton>
                                 <EditIcon size="20px" />
                              </IconButton>
                           </ButtonGroup>
                        </div>
                        <div>
                           <ButtonGroup>
                              <IconButton>
                                 <DeleteIcon size="20px" />
                              </IconButton>
                           </ButtonGroup>
                        </div>
                     </div>
                  ) : (
                     <ButtonGroup>
                        <TextButton
                           type="solid"
                           onClick={() => setActive(true)}
                        >
                           Upload
                        </TextButton>
                     </ButtonGroup>
                  )}

                  {active && (
                     <Popup size="460px" show={show}>
                        <AssetUploader
                           onImageSelect={data => {
                              setActive(false)
                              setIconUrl(data.url)
                           }}
                           onAssetUpload={data => {
                              setActive(false)
                              setIconUrl(data.url)
                           }}
                        ></AssetUploader>
                     </Popup>
                  )}
               </Form.Group>
               <Spacer size="16px" />
               <Flex container justifyContent="flex-end">
                  <ButtonGroup>
                     <TextButton type="solid" onClick={mutationFunc}>
                        Save
                     </TextButton>
                     <TextButton type="ghost" onClick={cancelPopupHandler}>
                        Cancel
                     </TextButton>
                  </ButtonGroup>
               </Flex>
            </>
         )}
      </Popup>
   )
}
