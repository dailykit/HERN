import React from 'react'
import styled from 'styled-components'
import { ChevronDown, ChevronUp } from '../../assets/icons'

const ChildNode = ({ child, clickHandler, navigationMenuItemId }) => {
   const [toggleParent, setToggleParent] = React.useState(false)
   const [toggleChild, setToggleChild] = React.useState(false)

   return (
      <StyledChild
         onClick={e => {
            e.stopPropagation()
            if (child?.action) {
               clickHandler(child)
            } else {
               setToggleParent(!toggleParent)
            }
         }}
      >
         <Child isActive={navigationMenuItemId === child?.id}>
            <p>{child.label}</p>
            {child?.childNodes?.length > 0 && (
               <StyledButton hasChild={child?.childNodes?.length > 0}>
                  {toggleParent ? (
                     <ChevronUp size="25px" color="#f9f9f9" />
                  ) : (
                     <ChevronDown size="25px" color="#f9f9f9" />
                  )}
               </StyledButton>
            )}
         </Child>
         {toggleParent &&
            child?.childNodes?.map(c => {
               return (
                  <div
                     onClick={e => {
                        e.stopPropagation()
                        if (c?.action) {
                           clickHandler(child)
                        } else {
                           setToggleChild(!toggleChild)
                        }
                     }}
                  >
                     <p>{c.label}</p>
                     {c?.childNodes?.length > 0 && (
                        <StyledButton hasChild={c?.childNodes?.length > 0}>
                           {toggleChild ? (
                              <ChevronUp size="25px" color="#f9f9f9" />
                           ) : (
                              <ChevronDown size="25px" color="#f9f9f9" />
                           )}
                        </StyledButton>
                     )}
                  </div>
               )
            })}
      </StyledChild>
   )
}

export default ChildNode

const StyledButton = styled.button`
   border: none;
   height: 18px;
   width: 18px;
   display: flex;
   align-items: center;
   justify-content: center;
   color: #f5f5f5;
   background: ${({ isChildOpen }) => (isChildOpen ? '#f3f3f3' : '#FFFFFF')};
   border-radius: 18.6691px;
`
const StyledChild = styled.div`
   width: 246px;
   font-style: normal;
   font-weight: 500;
   font-size: 12px;
   line-height: 14px;
   padding: 8px;
   margin: 4px 0px;

   &:hover {
      width: 246px;
      background: #ffffff;
      border-radius: 4px;
      margin: 4px 0px;
   }
`
const Child = styled.div`
   display: flex;
   align-items: center;
   justify-content: space-between;
   padding: 8px;
   text-transform: capitalize;

   > p {
      color: ${({ isActive }) => (isActive ? '#367BF5' : '#202020')};
   }
`
