import styled from 'styled-components'
import { theme } from '../../theme'

export const GoodiesWrapper = styled.div`
   padding: 2rem 0;
   .sub-heading {
      color: ${theme.colors.textColor5};
      font-weight: 400;
      text-align: left;
      margin-bottom: 20px;
      text-transform: uppercase;
   }
`
export const IngredientGrid = styled.div`
   display: grid;
   grid-template-columns: repeat(auto-fill, minmax(130px, 130px));
   grid-gap: 1rem;
   .goodiesCard {
      background: none;
      .goodiesImg {
         width: 130px;
         height: 160px;
         border-radius: 16px;
         object-fit: cover;
      }
      .goodieName {
         color: ${theme.colors.textColor5};
         font-family: 'Barlow Condensed';
         text-align: center;
         margin: 1rem 0;
      }
   }
   .ant-tag,
   .ant-tag-has-color {
      color: ${theme.colors.lightGreyText};
   }
   @media (max-width: 769px) {
      grid-template-columns: repeat(auto-fill, minmax(130px, 165px));
      .goodiesCard {
         .goodiesImg {
            width: 165px;
            height: 205px;
         }
      }
   }
`
