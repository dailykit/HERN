import styled from 'styled-components'
import { theme } from '../../theme'

export const StyledDiv = styled.div`
   position: relative;

   .owl-item {
      width: 320px !important;
   }
   .owl-carousel .owl-nav.disabled + .owl-dots {
      margin-top: 2rem;
   }
   .owl-carousel .owl-dots .owl-dot span {
      width: 10px !important;
      height: 10px !important;
      border-radius: 50%;
      background-color: ${theme.colors.textColor4} !important;
   }
   .owl-carousel .owl-dots .active span {
      background-color: ${theme.colors.textColor} !important;
   }
   .owl_carousel_item {
      width: 320px;
      border-radius: 16px;
   }
   .owl_carousel_item img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      border-radius: 16px;
   }
   .prev_btn,
   .next_btn {
      width: 120px;
      height: 100%;
      position: absolute;
      top: 0;
      z-index: 2;
      display: flex;
      align-items: center;
      display: none;
   }
   .prev_btn:hover,
   .next_btn:hover {
      cursor: pointer;
   }
   .prev_btn svg:hover,
   .next_btn svg:hover {
      stroke: ${theme.colors.textColor};
   }
   .prev_btn {
      left: 0;
      background: linear-gradient(
         -90deg,
         rgba(30, 49, 74, 0) 1.59%,
         #000 69.32%
      );
      justify-content: flex-start;
   }
   .next_btn {
      right: 0;
      background: linear-gradient(
         90deg,
         rgba(30, 49, 74, 0) 1.59%,
         #000 69.32%
      );
      justify-content: flex-end;
   }
   .my-masonry-grid {
      display: -webkit-box; /* Not needed if autoprefixing */
      display: -ms-flexbox; /* Not needed if autoprefixing */
      display: flex;
      width: auto;
      margin-right: 40px;
   }

   .my-masonry-grid_column > div {
      margin: 0 0 40px 40px;
   }
   @media (max-width: 769px) {
      .owl_carousel_item {
         height: 480px;
      }
      .my-masonry-grid {
         margin-right: 1rem;
      }
      .my-masonry-grid_column > div {
         margin: 0 0 1rem 1rem;
      }
   }
`
