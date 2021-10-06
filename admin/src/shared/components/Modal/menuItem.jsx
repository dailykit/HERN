import React, { useState } from 'react'
import styled from 'styled-components'
import { ChevronDown, ChevronUp } from '../../assets/icons'
import ChildNode from './ChildNode'

export default function MenuItem({ menuItem = {}, clickHandler, ...props }) {
   const [toggleMenu, setToggleMenu] = useState(false)

   return (
      <StyledWrapper
         isChildOpen={toggleMenu}
         {...props}
         hasChild={menuItem?.childNodes?.length > 0}
         onClick={e => {
            e.stopPropagation()
            if (menuItem?.action) {
               clickHandler()
            } else {
               setToggleMenu(!toggleMenu)
            }
         }}
      >
         <ButtonWrapper isActive={toggleMenu}>
            <p>{menuItem?.label}</p>

            {menuItem?.childNodes?.length > 0 && (
               <button>
                  {toggleMenu ? (
                     <ChevronUp size="16px" color="#919699" />
                  ) : (
                     <ChevronDown size="16px" color="#919699" />
                  )}
               </button>
            )}
         </ButtonWrapper>
         {menuItem?.childNodes?.length > 0 && toggleMenu && (
            <StyledChildren>
               {menuItem?.childNodes?.map(child => (
                  <ChildNode
                     key={child.id}
                     child={child}
                     clickHandler={clickHandler}
                     navigationMenuItemId={props?.navigationMenuItemId}
                  />
               ))}
            </StyledChildren>
         )}
      </StyledWrapper>
   )
}

export const StyledWrapper = styled.div`
   width: 100%;
   cursor: pointer;
   padding: 12px;
   margin-bottom: 4px;
   font-family: Roboto;
   font-style: normal;
   font-weight: 500;
   font-size: 14px;
   line-height: 16px;
   border-radius: 8px;
   background: ${({ isChildOpen }) =>
      isChildOpen ? '#f3f3f3' : 'transparent'};

   &:hover {
      background: #f3f3f3;
      border-radius: 8px;
   }
   > div {
      display: flex;
      align-items: center;
      justify-content: space-between;
   }
`
const ButtonWrapper = styled.div`
   display: flex;
   align-items: center;
   justify-content: space-between;
   margin-right: 0px !important;

   &:hover {
      > button {
         background: #ffffff;
      }
   }

   > p {
      color: ${({ isActive }) => (isActive ? '#367BF5' : '#202020')};
   }
   > button {
      border: none;
      height: 24px;
      width: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: transparent;
      border-radius: 18.6691px;
   }
`
const StyledChildren = styled.div`
   display: flex;
   align-items: center;
   flex-direction: column;
   justify-content: space-between;
   margin-top: 16px;
   border: 2px solid #ffffff;
   border-radius: 8px;
`
