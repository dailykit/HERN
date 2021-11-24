import styled from 'styled-components'
import { theme } from '../../../../theme'
export const Wrap = styled.div`
   .price-breakdown-info {
      font-family: Maven Pro;
      font-style: normal;
      font-weight: 500;
      font-size: 14px;
      line-height: 16px;
      color: ${theme.colors.textColor5};
      text-transform: uppercase;
      margin: 0;
      flex: 1;
   }
   .text-right {
      text-align: right;
   }
   .text-left {
      text-align: left;
   }
   .bold {
      font-weight: 900;
   }
   .red {
      color: ${theme.colors.textColor};
   }
   .flex-div {
      display: flex;
      justify-content: space-between;
   }
   .column {
      flex-direction: column;
   }
`
