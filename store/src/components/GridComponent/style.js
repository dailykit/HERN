import styled from 'styled-components'
import { theme } from '../../theme'

export const StyledWrapper = styled.div`
   width: 100%;
   height: 100%;
   padding: 0 24px;
   .outter-div {
      width: 100%;
      height: 100%;
      border-radius: 8px;
      overflow: hidden !important;
      position: relative !important;
      max-height: 440px !important;
      .show-all-btn {
         position: absolute !important;
         bottom: 16px !important;
         right: 16px !important;
         z-index: 2 !important;
         width: auto;
         padding: 0 8px;
         background: ${theme.colors.secondaryColor};
         text-transform: none;
         font-weight: 500;
      }
      .single__image {
         width: 100%;
         height: 100%;
         object-fit: cover;
      }
   }
   .cstmArrowBtn {
      width: auto;
      padding: 0 1rem;
      background: ${theme.colors.secondaryColor};
      height: 28px;
   }
   @media (min-width: 1128px) {
      padding: 0 40px;
   }
   @media (min-width: 950px) {
      padding: 0 16px;
   }
   @media (min-width: 744px) {
      padding: 0 16px;
   }
`

export const GridView = styled.div`
   display: grid;
   gap: 8px;
   grid-template-columns: 1fr 1.5fr 1fr;
   width: 100%;
   height: 100%;

   .grid-child {
      display: grid;
      grid-row: 1;
      img {
         object-fit: cover;
         height: 100% !important;
         width: 100% !important;
      }
   }
   .child1 {
      grid-column: 1;
   }
   .child2 {
      grid-column: 2;
      .child-grid {
         display: grid;
         grid-auto-columns: 1fr !important;
         grid-auto-rows: 1fr !important;
         gap: 8px !important;
         grid-template-columns: 1fr 1fr 1fr !important;
      }
      .child-grid-child1 {
         grid-column: 1 / span 2;
         grid-row: 1 / span 2;
      }
      .child-grid-child2 {
         grid-column: 3;
         grid-row: 1;
      }
      .child-grid-child3 {
         grid-column: 3;
         grid-row: 2;
      }
   }
   .child3 {
      grid-column: 3;
   }

   @media (max-width: 769px) {
      display: block;
      .grid-child {
         display: block;
         width: 100%;
         height: 100%;
      }
   }
`
