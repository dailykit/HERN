import styled from 'styled-components'

export const StyledSection = styled.div`
   display: grid;
   grid-template-columns: 250px 1fr;
   grid-gap: 32px;
   @media screen and (max-width: 925px) {
      grid-template-columns: auto;
   }
`

export const StyledListing = styled.div`
   display: flex;
   flex-direction: column;
   @media screen and (max-width: 925px) {
      flex-direction: row;
      overflow-x: auto;
   }
`

export const StyledDisplay = styled.div`
   background: #FFFFFF;
   border: 1px solid #F4F4F4;
   box-sizing: border-box;
   box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.1);
   border-radius: 20px;
   padding: 28px;
   margin-top: 0;
   overflow-x: auto;
`

export const StyledListingHeader = styled.div`
   display: flex;
   justify-content: space-between;
   align-items: center;
   margin-bottom: 16px;

   h3 {
      font-weight: 500;
      font-size: 16px;
      line-height: 19px;
      color: #888d9d;
   }

   svg {
      cursor: pointer;
   }
`

export const StyledListingTile = styled.div`
   padding: 20px 12px;
   cursor: pointer;
   position: relative;
   margin-bottom: 12px;
   min-width: fit-content;
   background: #FFFFFF;
   box-sizing: border-box;
   border-radius: 20px;

   :hover{
      border: 2px solid rgba(54, 123, 245, 0.5);
      box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.15);
   }
   box-shadow: ${props => (props.active ? '1px 1px 2px rgba(255, 255, 255, 0.3), -1px -1px 2px rgba(204, 204, 204, 0.5), inset -6px 6px 12px rgba(204, 204, 204, 0.2), inset 6px -6px 12px rgba(204, 204, 204, 0.2), inset -6px -6px 12px rgba(255, 255, 255, 0.9), inset 6px 6px 15px rgba(204, 204, 204, 0.9)' : '0px 2px 4px rgba(0, 0, 0, 0.1)')};
   border: ${props => (props.active ? '2px solid rgba(54, 123, 245, 0.5)' : '1px solid #F4F4F4' )};

   h3 {
      margin-bottom: 20px;
      font-weight: 500;
      font-size: 16px;
      line-height: 14px;
   }

   p {
      font-weight: normal;
      font-size: 12px;
      line-height: 14px;
      opacity: 0.7;
      &:not(:last-child) {
         margin-bottom: 8px;
      }
   }
   @media screen and (max-width: 767px) {
      margin-bottom: 0px;
      margin-left: 12px;
   }
`

export const Actions = styled.div`
   position: absolute;
   top: 20px;
   right: 0;

   span {
      margin-right: 12px;
   }
`
