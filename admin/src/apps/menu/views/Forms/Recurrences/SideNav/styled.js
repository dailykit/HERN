import styled from 'styled-components'

export const StyledContainer = styled.div`
   background: #f3f3f3;
   position: fixed;
   width: 250px;
   height: 100%;
`

export const List = styled.div`
   display: flex;
   flex-direction: column;

   a {
      display: block;
      padding: 16px 0;
      color: #555b6e;
      font-weight: 500;
      font-size: 20px;
      cursor: pointer;

      &.active {
         color: #00a7e1;
      }
   }
`
