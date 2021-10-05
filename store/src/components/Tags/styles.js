import styled from 'styled-components'
import { theme } from '../../theme'
export const Wrapper = styled.div`
   .heading {
      font-weight: 400;
      color: ${theme.colors.textColor};
      text-align: center;
      margin: 2rem 4rem;
      font-family: League-Gothic;
   }
   .customInput {
      margin-bottom: 1.5rem;
      color: ${theme.colors.textColor2};
   }
   .categoryTag {
      height: 48px;
      width: auto;
      padding: 1rem;
      margin: 8px;
      border: 1px solid ${theme.colors.textColor};
   }
   .selectedCategoryTag {
      background: ${theme.colors.textColor};
      color: ${theme.colors.textColor4};
      :hover {
         background: ${theme.colors.textColor4};
         color: ${theme.colors.textColor};
      }
   }
   .nonSelectedCategoryTag {
      background: ${theme.colors.textColor4};
      color: ${theme.colors.textColor};
      :hover {
         background: ${theme.colors.textColor};
         color: ${theme.colors.textColor4};
      }
   }

   .skip {
      display: flex;
      align-items: center;
      color: ${theme.colors.textColor2};
      font-size: ${theme.sizes.h6};
      margin-bottom: 6rem;
      justify-content: right;
      margin-right: 1rem;
      a {
         text-decoration: none;
         text-transform: uppercase;
         color: ${theme.colors.textColor};
         font-weight: 800;
      }
   }

   .submitBtnWrap {
      width: 100%;
      position: absolute;
      left: 0;
      bottom: 0;
      padding: 0;
      margin: 0;
      z-index: 3;
   }
   .submitBtn {
      height: 48px;
      font-size: ${theme.sizes.h8};
      background: ${theme.colors.textColor};
      color: ${theme.colors.textColor4};
      border-radius: 0px;
      &:disabled {
         background: ${theme.colors.textColor};
         height: 48px;
         cursor: not-allowed;
      }
   }

   .center-div-wrapper {
      width: 100%;
      margin: auto;
   }

   @media (min-width: 769px) {
      .skip {
         display: none;
      }
      .submitBtnWrap {
         position: relative;
         padding: 0;
         margin: 1rem 0;
         .submitBtn {
            border-radius: 8px;
         }
      }
      .center-div-wrapper {
         width: 80%;
      }
   }
`

export const CategoryTagWrap = styled.div`
   display: flex;
   flex-wrap: wrap;
   justify-content: center;
   margin-bottom: 4rem;
   @media (min-width: 769px) {
      margin: 0;
   }
`
