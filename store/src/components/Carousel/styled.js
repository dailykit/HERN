import styled from 'styled-components'
import { theme } from '../../theme'

export const StyledDiv = styled.div`
   position: relative;
   .item {
      height: 416px;
      border-radius: 16px;
   }
   .item img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      border-radius: 16px;
   }
   .prev_btn,
   .next_btn {
      width: 150px;
      height: 100%;
      position: absolute;
      top: 0;
      z-index: 2;
      display: flex;
      align-items: center;
   }
   .prev_btn:hover,
   .next_btn:hover {
      cursor: pointer;
   }
   .prev_btn svg:hover,
   .next_btn svg:hover {
      stroke: ${theme.colors.textColor};
   }
   .prev_btn {
      left: 0;
      background: linear-gradient(
         -91.76deg,
         rgba(30, 49, 74, 0) 1.59%,
         #061422 69.32%
      );
      justify-content: flex-start;
   }
   .next_btn {
      right: 0;
      background: linear-gradient(
         91.76deg,
         rgba(30, 49, 74, 0) 1.59%,
         #061422 69.32%
      );
      justify-content: flex-end;
   }
`
