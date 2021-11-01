import styled from 'styled-components'
import { theme } from '../../theme'

export const StyledDiv = styled.div`
   .my-masonry-grid {
      display: -webkit-box; /* Not needed if autoprefixing */
      display: -ms-flexbox; /* Not needed if autoprefixing */
      display: flex;
      width: auto;
      gap: 3rem;
      margin-right: 0;
   }

   .my-masonry-grid_column > div {
      margin: 0 0 2rem 0;
   }
   @media (max-width: 769px) {
      .my-masonry-grid {
         margin-right: 0;
      }
      .my-masonry-grid_column > div {
         margin: 0;
      }
   }
`
export const CategoryWiseDiv = styled.div`
   .category__title {
      color: ${theme.colors.textColor4};
      font-weight: 400;
      text-align: left;
      margin-bottom: 2rem;
   }
`
