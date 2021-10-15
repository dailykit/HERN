import styled from 'styled-components'
import { theme } from '../../../theme'
export const Wrapper = styled.div`
   padding: 0 1rem 1rem 1rem;
   .normal_heading {
      color: ${theme.colors.textColor5};
   }
   .custom-response-input {
      height: 48px;
      margin-bottom: 0;
      color: ${theme.colors.textColor5};
      background: ${theme.colors.lightBackground.white};
      font-family: Proxima Nova;
      font-weight: 700px;
      letter-spacing: 0.3em;
      ::placeholder {
         font-weight: 700px;
         letter-spacing: 0.3em;
         text-transform: uppercase;
      }
   }
`
