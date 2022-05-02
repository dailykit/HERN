import React from 'react'
import { toast } from 'react-toastify'
import { Spacer } from '@dailykit/ui'
import { Popconfirm } from 'antd'
import { Menu, MenuOptions, MenuOption } from './style'
import {
   CreateFile,
   CreateFolder,
   DeleteIcon,
   EditIcon,
   CopyIcon,
} from '../../assets/Icons'
import { useGlobalContext } from '../../context'
import { get_env } from '../../../../shared/utils'

const ContextMenu = ({ style, node }) => {
   const { setContextMenuInfo } = useGlobalContext()
   const options = [
      { id: 'cr-file', value: 'New File', type: 'file', action: 'create' },
      { id: 'cr-fold', value: 'New Folder', type: 'folder', action: 'create' },
      { id: 'rn-file', value: 'Rename File', type: 'file', action: 'rename' },
      {
         id: 'rn-fold',
         value: 'Rename Folder',
         type: 'folder',
         action: 'rename',
      },
      { id: 'dl-file', value: 'Delete File', type: 'file', action: 'delete' },
      {
         id: 'dl-fold',
         value: 'Delete Folder',
         type: 'folder',
         action: 'delete',
      },
      { id: 'cp-file', value: 'Copy File Path', type: 'file', action: 'copy' },
      {
         id: 'cr-block',
         value: 'Make it as a block',
         type: 'file',
         action: 'block',
      },
   ]

   const copyToClipboard = () => {
      const relativePath = node.path.replace(
         get_env('REACT_APP_ROOT_FOLDER'),
         ''
      )
      const fileUrl = `https://test.dailykit.org/template/files${relativePath}`
      navigator.clipboard.writeText(fileUrl).then(
         () => {
            toast.success('Copied!')
         },
         () => {
            toast.error('Something went wrong!')
         }
      )
   }

   const fetchIcon = (action, type) => {
      switch (action) {
         case 'create':
            if (type === 'folder') {
               return <CreateFolder size="20" />
            } else {
               return <CreateFile size="20" />
            }
         case 'rename':
            return <EditIcon size="20" />
         case 'delete':
            return <DeleteIcon size="20" />
         case 'copy':
            return <CopyIcon size="20" />
         default:
            return null
      }
   }

   const optionHandler = option => {
      if (option.type === 'file' && option.action === 'copy') {
         copyToClipboard()
      } else if (
         option.type === 'folder' ||
         (option.type === 'file' && option.action !== 'create')
      ) {
         setContextMenuInfo({
            ...option,
            contextPath: node.path,
            showPopup: {
               formTypePopup: true,
            },
         })
      } else if (option.type === 'file') {
         setContextMenuInfo({
            ...option,
            contextPath: node.path,
            showPopup: {
               fileTypePopup: true,
            },
         })
      }
   }

   return (
      <>
         <Popconfirm
            zIndex={100}
            autoAdjustOverflow
            title="Please Select option"
         >
            <Menu style={style}>
               <MenuOptions>
                  {node.type === 'folder' ? (
                     <>
                        {options.map(option => {
                           if (
                              option.type === 'folder' ||
                              option.action === 'create'
                           ) {
                              return (
                                 <MenuOption
                                    key={option.id}
                                    onClick={() => optionHandler(option)}
                                 >
                                    {fetchIcon(option.action, option.type)}
                                    <Spacer xAxis size="4px" />
                                    {option.value}
                                 </MenuOption>
                              )
                           }
                        })}
                     </>
                  ) : (
                     <>
                        {options.map(option => {
                           if (
                              (option.type === 'file' &&
                                 option.action !== 'create') ||
                              option.action === 'copy'
                           ) {
                              return (
                                 <MenuOption
                                    key={option.id}
                                    onClick={() => optionHandler(option)}
                                 >
                                    {fetchIcon(option.action, option.type)}
                                    <Spacer xAxis size="4px" />
                                    {option.value}
                                 </MenuOption>
                              )
                           }
                        })}
                     </>
                  )}
               </MenuOptions>
            </Menu>
         </Popconfirm>
      </>
   )
}

export default ContextMenu
