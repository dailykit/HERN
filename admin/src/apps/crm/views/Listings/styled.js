import styled from 'styled-components'

export const StyledWrapper = styled.div`
   margin: 0 auto;
   max-width: 1280px;
   margin-bottom: 80px;
   h1 {
      color: #555b6e;
      font-size: 20px;
      font-weight: 500;
      line-height: 23px;
   }
`

export const StyledHeader = styled.div`
   height: 80px;
   display: flex;
   align-items: center;
   justify-content: space-between;
`

export const StyledIconGroup = styled.div`
   display: flex;
   > div {
      margin-right: 4px;
   }
`

export const StyledIcon = styled.div`
   width: 32px;
   height: 32px;
   border-radius: 4px;
   background: rgba(40, 193, 247, 0.48);
`

export const StyledTableHeader = styled.div`
   height: 40px;
   display: flex;
   align-items: center;
   justify-content: space-between;
`

export const StyledTableActions = styled.div`
   display: grid;
   grid-auto-flow: column;
   grid-gap: 16px;
`
export const StyledContent = styled.div`
   margin-top: 32px;
   padding: 0 30px;
`

export const StyledPagination = styled.div`
   color: 555b6e;
   font-size: 14px;

   span {
      margin-left: 8px;
      cursor: pointer;
   }
`

export const GridContainer = styled.div`
   display: grid;
   grid-template-columns: repeat(2, 1fr);
   grid-gap: 8px;
`
