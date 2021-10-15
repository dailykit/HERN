import styled from 'styled-components'
import { theme } from '../../../theme'
export const Wrapper = styled.div`
   margin-top: 2rem;
   background: ${theme.colors.lightBackground.grey};
   position: unset;
   bottom: 0;
   z-index: 2;
   width: 100%;
   border-radius: 0 0 40px 40px;
   .poll-expiry-msg {
      font-style: italic;
      color: ${theme.colors.textColor5};
      text-align: center;
      margin-bottom: 8px;
   }
   .custom-submit-btn {
      height: 64px;
      background: ${theme.colors.textColor};
      color: ${theme.colors.textColor4};
      border-radius: 0 0 40px 40px;
      font-family: League-Gothic;
      letter-spacing: 0.04em;
   }
   @media (min-width: 769px) {
      .footer-sticky-btn-div {
         bottom: 2rem;
      }
   }
`
