import styled, { css } from 'styled-components'

export const StyledSidebar = styled.aside(
   ({ visible }) => css`
      top: 40px;
      bottom: 0;
      width: 240px;
      position: absolute;
      background: #d9e9f1;
      left: 0;
      transition: 0.3s ease-in-out;
      transform: translateX(${visible ? '0' : '-240px'});
      z-index: 2;
   `
)

export const StyledHeading = styled.h3`
   color: #76acc7;
   font-size: 16px;
   font-weight: 500;
   padding: 18px 12px 8px 12px;
   letter-spacing: 0.4px;
   text-transform: uppercase;
`

export const StyledList = styled.ul`
   padding: 0 12px;
`

export const StyledListItem = styled.li`
   height: 40px;
   display: flex;
   cursor: pointer;
   align-items: center;
   border-bottom: 1px solid #b4d5e6;
   :hover {
      border-bottom: 1px solid #66a1bd;
   }
`
