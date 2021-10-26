import styled from 'styled-components'
import { theme } from '../../theme'

export const BackDropDiv = styled.div`
   background: ${theme.colors.backDropColor};
   pointer-events: ${({ disabled }) => (disabled ? 'none' : 'unset')};
   display: ${({ show }) => (show ? 'fixed' : 'none')};
   justify-content: center;
   align-items: center;
   width: 100%;
   height: 100%;
   position: fixed;
   top: 0;
   left: 0;
   right: 0;
   bottom: 0;
   z-index: 10;
   cursor: pointer;
   .booking-done {
      margin-top: 4rem;
      padding: 1rem;
      img {
         width: 94px;
         height: 94px;
         display: block;
         margin-left: auto;
         margin-right: auto;
      }
      p {
         font-size: ${theme.sizes.h3};
         font-weight: 700;
         color: ${theme.colors.textColor4};
         text-align: center;
      }
   }
`
