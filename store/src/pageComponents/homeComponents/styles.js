import styled from 'styled-components'
import { theme } from '../../theme'

export const Wrapper = styled.div`
   width: 100%;
   height: 100%;
   .redirectClass {
      text-decoration: none;
      display: block;
      margin: 0;
      span {
         color: ${theme.colors.textColor};
         font-family: Barlow Condensed;
         font-style: normal;
         font-weight: bold;
         font-size: 24px;
         line-height: 62px;
         letter-spacing: 0.08em;
         padding: 8px 0;
      }
   }
   .wrapper-div {
      padding: 16px;
      width: 100%;
   }
   .recycler-heading-wrapper {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 1rem !important;
   }
   .recycler-heading {
      color: ${theme.colors.textColor5};
      font-weight: 600;
      text-align: left;
      margin-bottom: 20px;
      text-transform: uppercase;
      font-family: 'Barlow Condensed';
   }
   .card-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 1rem;
   }

   @media (min-width: 769px) {
      .recycler-heading-wrapper {
         justify-content: unset;
         gap: 8rem;
      }
      .card-grid {
         grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
      }
   }
`
