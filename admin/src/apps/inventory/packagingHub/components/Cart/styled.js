import styled, { css } from 'styled-components'

export const BalanceCard = styled.div`
   margin-top: 16px;
   border: 1px solid #cecece;
   padding: 16px 32px;

   display: flex;
   align-items: center;
   justify-content: space-between;

   ${({ selectable }) =>
      selectable &&
      css`
         cursor: pointer;

         &:hover {
            background-color: #f3f3f3;
         }
      `}

   h1 {
      font-size: 20px;
      color: #555b6e;
   }
`
