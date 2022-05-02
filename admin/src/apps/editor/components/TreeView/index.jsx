import React from 'react'
import { Flex } from '@dailykit/ui'
import {
   ArrowDown,
   ArrowRight,
   FolderIcon,
   Html,
   Css,
   Javascript,
   Pug,
   Ejs,
   Json,
   Liquid,
   FileIcon,
   XML,
} from '../../assets/Icons'
import isEmpty from 'lodash/isEmpty'

import { Parent, Node, Children, Icon } from './styles'
import { Tree } from 'antd'

const TreeView = ({ data, onSelection, onToggle, showContextMenu }) => {
   if (data.length === 0) {
      return <div>No Folders!</div>
   }
   const clickHandler = (keys, { node: selectedNode }) => {
      if (!isEmpty(selectedNode)) {
         onSelection(selectedNode)
      }
   }
   const onRightClickHandle = ({ event, node }) => {
      console.log('right click', event)
      showContextMenu(event, node)
   }

   const fetchIcon = node => {
      const extension = node.name.split('.').pop()
      if (node.type === 'folder') {
         return <FolderIcon size="24" color="#555b6e" />
      }
      switch (extension) {
         case 'html':
            return <Html size="24" color="#555b6e" />
         case 'js':
            return <Javascript size="24" color="#555b6e" />
         case 'css':
            return <Css size="24" color="#555b6e" />
         case 'pug':
            return <Pug size="24" color="#555b6e" />
         case 'ejs':
            return <Ejs size="24" color="#555b6e" />
         case 'json':
            return <Json size="24" color="#555b6e" />
         case 'liquid':
            return <Liquid size="24" color="#555b6e" />
         case 'xml':
            return <XML size="24" color="#555b6e" />
         default:
            return <FileIcon size="24" color="#555b6e" />
      }
   }
   // return data.map((node, nodeIndex) => {
   //    return (
   //       node.name && (
   //          <Parent key={node.name}>
   //             <Flex container alignItems="center">
   //                <Node
   //                   isOpen={node.isOpen}
   //                   onClick={() => {
   //                      onSelection(node, nodeIndex)
   //                   }}
   //                   onContextMenu={e => showContextMenu(e, node)}
   //                >
   //                   <Flex container alignItems="center" margin="0 4px 0 0">
   //                      {node.type === 'folder' && (
   //                         <Icon
   //                            isOpen={node.isOpen}
   //                            onClick={e => {
   //                               e.stopPropagation()
   //                               onToggle(node.path)
   //                            }}
   //                         >
   //                            {node.isOpen ? (
   //                               <ArrowDown size="20" color="#555b6e" />
   //                            ) : (
   //                               <ArrowRight size="20" color="#555b6e" />
   //                            )}
   //                         </Icon>
   //                      )}
   //                      {fetchIcon(node)}
   //                   </Flex>
   //                   <span>{node.name}</span>
   //                </Node>
   //             </Flex>
   //             {node.isOpen && (
   //                <Children>
   //                   {node.children.length > 0 && (
   //                      <TreeView
   //                         data={node.children}
   //                         onSelection={onSelection}
   //                         onToggle={onToggle}
   //                         showContextMenu={showContextMenu}
   //                      />
   //                   )}
   //                </Children>
   //             )}
   //          </Parent>
   //       )
   //    )
   // })
   return (
      <Tree.DirectoryTree
         onSelect={clickHandler}
         fieldNames={{
            title: 'name',
            key: 'path',
            children: 'children',
         }}
         onRightClick={onRightClickHandle}
         treeData={data}
      />
   )
}

export default TreeView
