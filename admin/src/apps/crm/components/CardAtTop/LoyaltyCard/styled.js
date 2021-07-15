import styled from 'styled-components'

export const StyledCard = styled.div`
   background: ${props =>
      props.active ? 'rgba(255, 255, 255, 0.4)' : '#ffffff'};
   border: 1px dashed #f3f3f3;
   box-shadow: 3px 3px 16px rgba(0, 0, 0, 0.06);
   width: 100%;
   margin-right: 16px;
   min-width: 280px;
   &:hover {
      background: ${props => !props.active && 'rgba(255, 255, 255, 0.4)'};
   }
   .cardContent {
      border-top: 1px solid #ececec;
   }
`

export const ViewTab = styled.span`
   color: #00a7e1;
   font-size: 18px;
   font-weight: normal;
   font-style: normal;
   font-family: Roboto;
   line-height: 14px;
   cursor: pointer;
   &:hover {
      text-decoration: underline;
   }
`
