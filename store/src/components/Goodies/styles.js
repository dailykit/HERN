import styled from 'styled-components'
import { theme } from '../../theme'

export const Wrapper = styled.div`
   padding: 2rem 1rem;
   .sub-heading {
      color: ${theme.colors.textColor5};
      font-weight: 400;
      text-align: left;
      margin-bottom: 20px;
      text-transform: uppercase;
   }
   .subsub-heading {
      color: ${theme.colors.textColor5};
      font-weight: 700;
      text-align: left;
      margin-bottom: 20px;
   }
   .box-open-img {
      margin-bottom: 40px;
      width: 200px;
      border-radius: 4px;
      object-fit: cover;
   }
   .goodiesImgWrapper {
      width: 80px;
      background: none;
      .goodiesImg {
         width: 100%;
         height: 100%;
         border-radius: 4px;
         object-fit: cover;
      }
      .goodieName {
         font-size: ${theme.sizes.h7};
         color: ${theme.colors.textColor4};
         text-align: center;
      }
   }
   .about-exp {
      text-align: justify;
      font-size: ${theme.sizes.h6};
      color: ${theme.colors.textColor4};
      font-weight: 400;
      margin-bottom: 46px;
   }
   .readMore {
      border: none;
      text-align: center;
      text-transform: uppercase;
      font-weight: 800;
      font-size: ${theme.sizes.h4};
      color: ${theme.colors.textColor};
      background: none;
      cursor: pointer;
      margin-bottom: 56px;
   }
   .ingredients_grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
      grid-gap: 1rem;
   }
   @media (min-width: 769px) {
      .about-exp {
         font-size: ${theme.sizes.h9};
      }
      .readMore {
         font-size: ${theme.sizes.h3};
      }
   }
`
