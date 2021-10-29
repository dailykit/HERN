import styled from 'styled-components'
import { theme } from '../../../theme'
export const Card = styled.div`
   display: flex;
   flex-direction: column;
   align-items: flex-start;
   background: none;
   box-shadow: ${({ boxShadow = true }) =>
      boxShadow
         ? '0px 8px 12px 2px rgba(0, 0, 0, 0.32)'
         : 'none' || '0px 8px 12px 2px rgba(0, 0, 0, 0.32)'};
   cursor: pointer;
   position: relative;
   overflow: hidden;
   transition: all 0.3s ease-in-out;
`

export const CardImage = styled.div`
   width: 100%;
   height: 100%;
   overflow: hidden;
   border-radius: 16px;
   img {
      width: 100%;
      height: 280px;
      object-fit: cover;
      transition: transform 650ms;
      &:hover {
         transform: scale(1.03);
      }
   }
`

export const CardBody = styled.div`
   color: ${theme.colors.textColor2};
   width: 100%;
   padding: 1rem 0.5rem;
   .exp-name {
      margin: 4px 0 4px 0;
      font-weight: 500;
      text-align: left;
      font-family: 'Maven Pro';
      letter-spacing: 0.16em;
      font-weight: 500;
      text-transform: uppercase;
      color: ${theme.colors.textColor5};
   }
   .kit-price {
      font-weight: 800;
      font-family: 'Maven Pro';
      letter-spacing: 0.16em;
      text-transform: uppercase;
      color: ${theme.colors.textColor7};
      span {
         font-weight: 400;
         font-size: ${theme.sizes.h7};
      }
   }
   .booked-kit {
      text-align: center;
      font-weight: 800;
      font-family: 'Maven Pro';
      letter-spacing: 0.16em;
      text-transform: uppercase;
      color: ${theme.colors.textColor5};
      cursor: pointer;
      margin: 0;
   }

   .duration {
      display: flex;
      align-items: center;
      span {
         margin-left: 8px;
         font-size: ${theme.sizes.h7};
      }
   }
   .expertImgDiv {
      width: 14px;
      height: 14px;
   }
   .expert-img {
      width: 100%;
      height: 100%;
      border-radius: 50px;
   }

   .product-discount-tag {
      border: 0px solid black;
      background: rgb(17, 27, 43);
      box-sizing: border-box;
      font-size: 0.8rem;
      font-style: italic;
      padding: 2px;
      color: #fff;
      position: absolute;
      right: 4px;
      top: -4px;
   }
   .product_add_wrap {
      display: flex;
      align-items: center;
      .icon_wrap {
         width: 20px;
         height: 20px;
         background: #fff;
         border-radius: 50%;
         margin-left: 8px;
      }
      .icon_wrap_1 {
         width: 20px;
         height: 20px;
         background: ${theme.colors.textColor5};
         border-radius: 50%;
         margin-left: 8px;
      }
   }

   .product_extra_info_text {
      margin: 8px 0;
      font-family: 'Maven Pro';
      letter-spacing: 0.16em;
      font-weight: 500;
      text-transform: uppercase;
      color: ${theme.colors.textColor7};
   }

   @media (min-width: 769px) {
      .exp-name {
         margin: 1rem 0 0.5rem 0;
         font-size: ${theme.sizes.h4};
      }
      .duration {
         span {
            font-size: ${theme.sizes.h8};
         }
      }
      .expertImgDiv {
         width: 24px;
         height: 24px;
      }
   }
`

export const TagGroup = styled.div`
   display: flex;
   flex-wrap: wrap;
   align-items: center;
   gap: 6px;
   margin: 0.5rem 0;
`

export const Tag = styled.div`
   font-size: ${theme.sizes.h8};
   color: ${theme.colors.textColor4};
   background: ${theme.colors.lightestGrey};
   text-transform: capitalize;
   padding: 4px;
   border-radius: 4px;
`
