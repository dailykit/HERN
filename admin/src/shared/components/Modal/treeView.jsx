import React from 'react'
import styled from 'styled-components'
import MenuItem from './menuItem'

const TreeView = ({ data = [], clickHandler, navigationMenuItemId }) => {
   let treeData = data
   if (treeData.length === 0) {
      return <EmptyMsg>No Menu Item! Try adding one!</EmptyMsg>
   }
   return (
      <>
         {treeData.map(node => {
            return (
               node.id && (
                  <Parent key={node.id}>
                     <MenuItem
                        clickHandler={clickHandler}
                        menuItem={node}
                        navigationMenuItemId={navigationMenuItemId}
                     />
                  </Parent>
               )
            )
         })}
      </>
   )
}

export default TreeView

export const Parent = styled.div`
   height: auto;
   display: flex;
   flex-direction: column;
   align-items: flex-start;
   margin-right: 5px;
`

export const Children = styled.div`
   width: 100%;
   font-style: normal;
   font-weight: 500;
   font-size: 12px;
   line-height: 14px;
   border: 1px solid #320e3b;
   margin-bottom: 4px;
   padding: 16px;
   background: #3c1845;
`
export const EmptyMsg = styled.div`
   margin: 16px;
   font-size: 20px;
`
