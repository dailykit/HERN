import React from 'react'
import styled, { css } from 'styled-components'
import { PlaceHolderImgIcon } from '../../../../../../../shared/assets/icons'

export const PageModuleCard = ({ onClick, content, isActive }) => {
   return (
      <StyledCard onClick={onClick} isActive={isActive} title={content.title}>
         <div>
            {!content.img && <PlaceHolderImgIcon />}
            {content.img && (
               <div>
                  <img src={content.img} alt={content.title} />
               </div>
            )}
            <h3>{content.title}</h3>
         </div>
      </StyledCard>
   )
}

const StyledCard = styled.li(
   ({ isActive }) => css`
      display: flex;
      list-style: none;
      padding-left: 12px;
      position: relative;
      background: ${isActive ? '#F3F3F3' : 'transparent'};
      h3 {
         color: #555b6e;
         font-size: 16px;
         font-weight: 400;
      }
      &:after {
         top: 0;
         left: 0;
         right: 0;
         bottom: 0;
         z-index: 1;
         content: '';
         position: absolute;
         background: transparent;
      }
      font-size: 16px;
      padding-left: 0;
      align-items: center;
      background: #ffffff;
      border: ${isActive ? '2px solid #367BF5' : `1px solid #e5e5e5`};
      border-radius: 6px;
      text-align: center;
      justify-content: center;
      h3 {
         font-family: Roboto;
         font-style: normal;
         font-weight: 500;
         font-size: 16px;
         line-height: 19px;
         color: ${isActive ? '#367BF5' : `#919699`};
         padding-top: 4px;
         width: 108px;
         white-space: nowrap;
         overflow: hidden;
         text-overflow: ellipsis;
      }
      > div {
         > div {
            height: 80px;
            width: 100px;
            > img {
               height: 100%;
               width: 100%;
               border-radius: 4px;
            }
         }
      }
   `
)
