import styled from 'styled-components'
import { theme } from '../../theme'

export const Wrapper = styled.div`
   width: 100%;
   height: 100%;
   .redirectClass {
      color: ${theme.colors.textColor};
      text-decoration: none;
      text-align: center;
      display: block;
      margin: 0;
      font-size: 20px;
      font-weight: 800;
      span {
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
      font-weight: 400;
      text-align: left;
      margin-bottom: 20px;
      text-transform: uppercase;
      font-family: League-Gothic;
   }
   .card-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
      gap: 1rem;
   }

   @media (min-width: 769px) {
      .recycler-heading-wrapper {
         justify-content: unset;
         gap: 8rem;
      }
   }
`
