import styled from 'styled-components'
import { theme } from '../../theme'

export const StyledDiv = styled.div`
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
      .my-masonry-grid {
         margin-right: 1rem;
      }
      .my-masonry-grid_column > div {
         margin: 0 0 1rem 1rem;
      }
   }
`
export const CategoryWiseDiv = styled.div`
   .experienceHeading2 {
      font-size: ${theme.sizes.h8};
      color: ${theme.colors.textColor4};
      font-weight: 400;
      text-align: left;
      margin-bottom: 2rem;
      padding-left: 3rem;
   }
`
