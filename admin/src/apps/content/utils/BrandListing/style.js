import styled, { css } from 'styled-components'

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
   padding-left: ${props => props.default && '4px'};
   cursor: pointer;
   align-items: center;
   border-bottom: 1px solid #b4d5e6;
   background: ${props => props.default && '#F9F9F9'};
   :hover {
      background: #f9f9f9;
      padding-left: 4px;
   }
`
