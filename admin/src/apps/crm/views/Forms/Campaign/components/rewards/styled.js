import styled from 'styled-components'

export const StyledContainer = styled.div`
   box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2);
   transition: 0.3s;
   background-color: #ffffff;
   width: 100%;
   margin: 16px 0 0 0;
   padding: 16px;
   p {
      color: #00a7e1;
      &:hover {
         text-decoration: underline;
      }
   }
   &:hover {
      box-shadow: 0 8px 16px 0 rgba(0, 0, 0, 0.2);
   }
`

export const StyledRow = styled.div`
   margin: 16px 0;
   display: flex;
   flex-direction: row;
   justify-content: space-between;
   button {
      padding: 0;
   }
`

export const StyledAction = styled.div`
   position: absolute;
   right: 16px;
   top: 16px;
`
export const RewardDiv = styled.div`
   margin: 16px 0;
   padding: 6px;
   background-color: #e5e5e5;
   display: grid;
   grid-template-columns: 1fr 0fr;
   span {
      background-color: #ffffff;
      padding: 2px;
      border-radius: 4px;
   }
   div {
      background-color: #e5e5e5;
      margin: 0;
   }
   button {
      height: 25px;
      padding: 2px;
      margin-left: 2px;
      border-radius: 4px;
   }
`

export const StyledDiv = styled.div`
   display: flex;
   flex-direction: row;
`
