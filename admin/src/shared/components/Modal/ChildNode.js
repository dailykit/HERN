import React from 'react'
import styled from 'styled-components'
import { ChevronDown, ChevronUp } from '../../assets/icons'

const ChildNode = ({ child, clickHandler }) => {
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
         <div>
            <p>{child.label}</p>
            {child?.childNodes?.length > 0 && (
               <StyledButton hasChild={child?.childNodes?.length > 0}>
                  {toggleParent ? (
                     <ChevronUp size="16px" color="#fff" />
                  ) : (
                     <ChevronDown size="16px" color="#fff" />
                  )}
               </StyledButton>
            )}
         </div>
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
                              <ChevronUp size="16px" color="#fff" />
                           ) : (
                              <ChevronDown size="16px" color="#fff" />
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
   background: #3c1845;
   box-shadow: ${({ hasChild }) =>
      hasChild
         ? `-5px 5px 10px rgba(37, 15, 43, 0.2),
            5px -5px 10px rgba(37, 15, 43, 0.2),
            -5px -5px 10px rgba(83, 33, 95, 0.9),
            5px 5px 13px rgba(37, 15, 43, 0.9),
            inset 1px 1px 2px rgba(83, 33, 95, 0.3),
            inset -1px -1px 2px rgba(37, 15, 43, 0.5)`
         : 'none'};
   border-radius: 18.6691px;
`
const StyledChild = styled.div`
   width: 100%;
   font-style: normal;
   font-weight: 500;
   font-size: 12px;
   line-height: 14px;
   padding: 8px;
   background: #3c1845;
   &:hover {
      background: #320e3b;
   }
   > div {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 8px;
      text-transform: capitalize;
   }
`
