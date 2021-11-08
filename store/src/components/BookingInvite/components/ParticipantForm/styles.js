import styled from 'styled-components'
import { theme } from '../../../../theme'

export const Wrapper = styled.div`
   width: 100%;
   height: 100%;
   color: ${theme.colors.textColor4};
   .proxinova_text {
      font-family: 'Maven Pro';
      font-style: normal;
      font-weight: 600;
      letter-spacing: 0.16em;
      color: ${theme.colors.textColor5};
      margin-bottom: 0 !important;
   }
   .main_container {
      width: 100%;
      margin: 0 auto;
   }
   .edit-tunnel-header {
      font-weight: 600;
      color: ${theme.colors.textColor};
      text-align: center;
      margin-bottom: 1rem;
      font-family: 'Barlow Condensed';
   }
   .input-label {
      color: ${theme.colors.textColor7};
      margin: 8px 4px;
      font-family: 'Maven Pro';
      font-style: normal;
      font-weight: 600;
      letter-spacing: 0.16em;
   }
   .address-form-input {
      height: 48px;
      margin: 0.5rem 0;
      color: ${theme.colors.textColor5};
      background: ${theme.colors.lightBackground.grey};
      font-family: 'Maven Pro';
      font-weight: 700px;
      letter-spacing: 0.3em;
      ::placeholder {
         font-weight: 700px;
         letter-spacing: 0.3em;
         text-transform: uppercase;
      }
   }

   @media (min-width: 769px) {
      .main_container {
         width: 90%;
         margin: 2rem auto;
      }
   }
`
