import styled from 'styled-components'
import { theme } from '../../theme'
export const Wrapper = styled.div`
   width: 100%;
   height: 100%;
   text-align: center;
   .info-div {
      width: 100%;
      height: 50px;
      transition: height 0.3s;
      overflow: hidden;
   }
   .read-more-btn {
      border: none;
      text-align: center;
      text-transform: uppercase;
      font-weight: 800;
      font-size: 20px;
      color: ${theme.colors.textColor};
      background: none;
      cursor: pointer;
      margin-top: 1rem;
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
