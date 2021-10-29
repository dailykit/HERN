import styled from 'styled-components'
import { theme } from '../../../theme'
export const Wrapper = styled.div`
   .modal-content-div {
      color: ${theme.colors.textColor4};
      .pinImg {
         width: 50px;
         height: 50px;
         display: block;
         margin: 1rem auto;
      }
      .response-sub-head {
         color: ${theme.colors.textColor5};
         margin-bottom: 2rem;
         text-align: left;
      }
      .custom-response-input {
         height: 48px;
         margin-bottom: 0;
         color: ${theme.colors.textColor5};
         background: ${theme.colors.lightBackground.white};
         font-family: 'Maven Pro';
         font-weight: 700px;
         letter-spacing: 0.3em;
         ::placeholder {
            font-weight: 700px;
            letter-spacing: 0.3em;
            text-transform: uppercase;
         }
      }
      .custom-done-btn-wrapper {
         background: ${theme.colors.mainBackground};
         position: absolute;
         bottom: 2rem;
         left: 0;
         z-index: 5;
         padding: 1rem;
         width: 100%;
      }
      .custom-done-btn {
         height: 48px;
      }
   }
   .slots-wrapper {
      padding: 1rem;
      margin-bottom: 1rem;
   }

   .footer-sticky-btn-div {
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
   }
`
