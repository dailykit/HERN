import React, { useContext, useEffect } from 'react'
import MenuItem from '../MenuItem'
import NavMenuContext from '../../../../../context/NavMenu'
import { DragNDrop, InlineLoader } from '../../../../../../../shared/components'
import { useDnd } from '../../../../../../../shared/components/DragNDrop/useDnd'

import { Parent, Children, EmptyMsg } from './styles'

const TreeView = ({ data = [], onToggle }) => {
   const [navMenuContext, setNavMenuContext] = useContext(NavMenuContext)
   const { menuItems } = navMenuContext
   const { initiatePriority } = useDnd()
   let treeData = []
   if (data.length) {
      treeData = data
   } else {
      treeData = menuItems
   }
   useEffect(() => {
      initiatePriority({
         tablename: 'navigationMenuItem',
         schemaname: 'website',
         data: treeData,
      })
   }, [menuItems])
   if (treeData.length === 0) {
      return <EmptyMsg>No Menu Item! Try adding one!</EmptyMsg>
   }
   return (
      <DragNDrop
         list={treeData}
         droppableId="MenuItemDroppableId"
         tablename="navigationMenuItem"
         schemaname="website"
      >
         {treeData.map(node => {
            return (
               node.id && (
                  <Parent key={node.id}>
                     <MenuItem menuItem={node} />
                     {node.isChildOpen && (
                        <Children>
                           {node.childNodes.length > 0 && (
                              <TreeView
                                 data={node.childNodes}
                                 onToggle={onToggle}
                              />
                           )}
                        </Children>
                     )}
                  </Parent>
               )
            )
         })}
      </DragNDrop>
   )
}

export default TreeView
