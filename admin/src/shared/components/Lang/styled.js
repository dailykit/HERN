import styled from 'styled-components'

export const StyledWrapper = styled.div`
   position: fixed;
   bottom: 16px;
   right: 16px;
`

export const IconContainer = styled.span`
   cursor: pointer;
   position: absolute;
   bottom: 0;
   right: 0;
`

export const StyledList = styled.ul`
   background: #efefef;
   padding: 4px;
   border-radius: 16px;
   margin-right: 16px;
   margin-bottom: 16px;
   list-style-type: none;
`

export const StyledListItem = styled.li`
   padding: 8px;
   cursor: pointer;
   color: ${props => (props.active ? '#28C1F6' : '#666')};
   font-weight: 500;

   &:not(:last-child) {
      border-bottom: 1px solid #ddd;
   }
`
