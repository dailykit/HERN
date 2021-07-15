import styled from 'styled-components'

export const StyledWrapper = styled.div`
   padding: 16px 0 16px 16px;
   width: 100%;
   background: #f3f3f3;
`
export const StyledContainer = styled.div`
   display: flex;
   flex-direction: row;
`
export const StyledTable = styled.div`
   padding: 16px;
   background: #ffffff;
   width: 100%;
`
export const StyledSideBar = styled.div`
   width: 20%;
`
export const StyledMainBar = styled.div`
   width: 80%;
   display: flex;
   flex-direction: column;
`
export const FlexContainer = styled.div`
   display: flex;
   flex-direction: row;
   width: 98%;
   justifycontent: space-between;
   margin: 0 16px 16px 0;
   overflow: auto;
   &::-webkit-scrollbar {
      display: none;
   }
`
