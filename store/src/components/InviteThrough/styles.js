import styled from 'styled-components'
import { theme } from '../../theme'

export const Wrapper = styled.div`
   padding: 1rem;
   color: ${theme.colors.textColor5};
   margin-bottom: 5rem;
   .proxinova_text {
      font-family: Proxima Nova;
      font-style: normal;
      font-weight: 600;
      letter-spacing: 0.16em;
      color: ${theme.colors.textColor5};
      margin-bottom: 0 !important;
   }
   .main_container {
      width: 100%;
      margin: 2rem auto;
   }
   .label {
      color: ${theme.colors.textColor7};
      display: block;
   }
   .small_text {
      font-weight: 400;
      color: ${theme.colors.textColor7};
   }

   .customInput {
      height: 48px;
      margin: 1rem 0;
      color: ${theme.colors.textColor5};
      background: ${theme.colors.lightBackground.grey};
      font-family: Proxima Nova;
      font-weight: 700px;
      letter-spacing: 0.3em;
      ::placeholder {
         font-weight: 700px;
         letter-spacing: 0.3em;
         text-transform: uppercase;
      }
   }
   .invitation-address {
      padding: 10px;
      color: ${theme.colors.textColor4};
      background: #eb98ad;
      border-radius: 2px;
      margin: 4px;
   }
   .remove-btn {
      margin-left: 4px;
   }
   .invite-h1-head {
      font-weight: 600;
      color: ${theme.colors.textColor};
      text-align: center;
      margin-bottom: 1rem;
      font-family: League-Gothic;
   }

   @media (min-width: 769px) {
      .label {
         display: inline;
      }
      .small_text {
         margin-left: 8px;
      }
      .main_container {
         width: 90%;
      }
   }
`
