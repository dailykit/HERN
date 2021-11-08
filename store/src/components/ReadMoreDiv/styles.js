import styled from 'styled-components'
import { theme } from '../../theme'
export const Wrapper = styled.div`
   width: 100%;
   height: 100%;
   .info-div {
      width: 100%;
      height: 25px;
      transition: height 0.3s;
      overflow: hidden;
      text-align: center;
   }
   .read-more-btn {
      border: none;
      text-align: left;
      text-transform: uppercase;
      font-weight: 600;
      color: ${theme.colors.textColor};
      background: none;
      cursor: pointer;
      position: relative;
      -webkit-text-decoration: none;
      text-decoration: none;
      padding: 4px 0;
   }
   @media (min-width: 769px) {
      .read-more-btn {
         font-size: 24px;
      }
   }
`
