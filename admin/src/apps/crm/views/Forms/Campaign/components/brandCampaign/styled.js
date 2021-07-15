import styled from 'styled-components'

export const StyledHeader = styled.div`
   align-items: center;
   width: 100%;
   display: grid;
   margin: 42px 0;
   grid-template-columns: ${props => props.gridCol || '1fr 1fr'};
   @media (max-width: 780px) {
      width: 100%;
   }
   @media (max-width: 567px) {
      grid-template-columns: 1fr;
   }
`
export const StyledWrapper = styled.div`
   margin: 0 32px;
   h1 {
      color: #555b6e;
      font-size: 20px;
      font-weight: 500;
      line-height: 23px;
   }
`
export const StyledPagination = styled.div`
   color: 555b6e;
   font-size: 14px;

   span {
      margin-left: 8px;
      cursor: pointer;
   }
`
export const StyledDiv = styled.div`
   display: inline;
`
export const CircularSpan = styled.span`
   border: 1px solid #555b6e;
   box-sizing: border-box;
   border-radius: 60px;
   padding: 2px 10px;
`

export const StyledCell = styled.div`
   border-top: 1px solid #ececec;
   display: flex;
   flex-direction: row;
   justify-content: space-between;
   padding: 16px;
`
