import styled from 'styled-components'
import { theme } from '../../../theme'

export const Wrap = styled.div`
   .calendar-img {
      width: 70px;
      height: 70px;
      display: block;
      margin: 1rem auto;
   }
   .proxima_nova {
      font-family: Proxima Nova;
      font-style: normal;
      font-weight: 600;
      letter-spacing: 0.1em;
   }
   .sub-heading {
      color: ${theme.colors.textColor5};
      text-align: center;
   }
   .small-heading {
      color: ${theme.colors.textColor5};
      text-align: center;
      margin: 20px 0;
   }
`
