import styled from 'styled-components'
import { theme } from '../../theme'

export const FooterWrapper = styled.footer`
   height: 180px;
   display: flex;
   align-items: center;
   padding: 1rem 2rem;
   justify-content: space-between;
   background: ${theme.colors.darkBackground.lightblue};
   @media (max-width: 768px) {
   }
   .nav-list {
      list-style: none;
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0;
      margin: 0 auto;
   }
   .nav-list-item {
      list-style: none;
      padding: 12px;
      width: 20px;
      height: 20px;
      background: ${theme.colors.textColor};
      cursor: pointer;
   }
   .nav-list-item:hover,
   .nav-list-item.active {
      background: ${theme.colors.mainBackground};
      border: ${`1px solid ${theme.colors.textColor}`};
   }
`
