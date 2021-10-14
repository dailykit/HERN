import styled from 'styled-components'
import { theme } from '../../theme'

export const Wrapper = styled.div`
   padding: 0;
   margin-bottom: 0;
   .invite-heading-h1 {
      font-weight: 600;
      color: ${theme.colors.textColor7};
      text-align: left;
      margin: 2rem 0;
   }
   .proxinova_text {
      font-family: Proxima Nova;
      font-style: normal;
      font-weight: 600;
      letter-spacing: 0;
      color: ${theme.colors.textColor5};
      margin-bottom: 0 !important;
   }

   .slot-count {
      color: ${theme.colors.textColor7};
   }

   .expiry-head {
      font-style: italic;
      color: ${theme.colors.textColor7};
   }

   .slots-wrapper-1 {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin: 1rem;
   }
`

export const GridView = styled.div`
   display: flex;
   justify-content: center;
   justify-items: center;
   align-items: center;
   @media (min-width: 769px) {
      display: flex;
      width: 350px;
      height: 350px;
      margin: 0 auto 1rem auto;
      justify-content: center;
      align-items: center;
   }
`
