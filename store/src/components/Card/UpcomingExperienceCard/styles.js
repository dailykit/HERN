import styled from 'styled-components'
import { theme } from '../../../theme'
export const Card = styled.div`
   display: flex;
   flex-direction: column;
   align-items: flex-start;
   background: ${theme.colors.mainBackground};
   box-shadow: ${({ boxShadow = 'true' }) =>
      boxShadow === 'true'
         ? '0px 8px 12px 2px rgba(0, 0, 0, 0.32)'
         : 'none' || '0px 8px 12px 2px rgba(0, 0, 0, 0.32)'};
   border-radius: 16px;
   cursor: pointer;
   overflow: hidden;
   transition: all 0.3s ease-in-out;
   position: relative;
   &:hover {
      box-shadow: rgba(0, 0, 0, 0.32) 0px 19px 43px;
      transform: translate3d(0px, -1.5px, 0px);
   }
   width: ${({ customWidth }) => customWidth};
   .book-exp {
      color: ${theme.colors.textColor4};
      background: ${theme.colors.textColor};
      text-transform: uppercase;
      font-family: Barlow Condensed;
      font-style: normal;
      font-weight: bold;
      font-size: 18px;
      line-height: 25px;
      text-align: center;
      letter-spacing: 0.16em;
      height: 45px;
      border-radius: 0 0 16px 16px;
      position: absolute;
      left: 0;
      bottom: 0;
   }
`

export const CardImage = styled.div`
   width: 100%;
   height: 120px;
   overflow: hidden;
   img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 650ms;
      &:hover {
         transform: scale(1.03);
      }
   }
   @media (min-width: 769px) {
      height: 180px;
   }
`

export const CardBody = styled.div`
   color: ${theme.colors.textColor2};
   width: 100%;
   padding: 1rem 1rem 4rem 1rem;
   .flex-div {
      display: flex;
      align-items: center;
      justify-content: space-between;
   }
   .exp-name {
      margin: 4px 0 4px 0;
      font-family: 'Barlow Condensed';
      font-style: normal;
      font-weight: bold;
      font-size: 24px;
      line-height: 25px;
      letter-spacing: 0.16em;
      color: ${theme.colors.textColor4};
      text-transform: uppercase;
   }
   .exp-info {
      font-weight: 800;
      text-transform: uppercase;
      span {
         font-weight: 400;
         font-size: ${theme.sizes.h7};
         text-transform: uppercase;
      }
   }
   .duration {
      display: flex;
      align-items: center;
      span {
         margin-left: 8px;
         font-family: 'Maven Pro';
         font-style: normal;
         font-weight: bold;
         font-size: 12px;
         line-height: 14px;
         text-align: right;
         letter-spacing: 0.24em;
         color: ${theme.colors.textColor4};
         text-transform: uppercase;
      }
   }
   .expertImgDiv {
      width: 100%;
      display: flex;
      flex: 1;
      align-items: center;
   }
   .expert-img {
      width: 28px;
      height: 28px;
      border-radius: 50px;
      margin-right: 0.5rem;
   }
   .expert-name {
      margin-bottom: 0 !important;
      font-family: 'Maven Pro';
      font-style: normal;
      font-weight: bold;
      font-size: 12px;
      line-height: 14px;
      letter-spacing: 0.26em;
      color: ${theme.colors.textColor};
      text-transform: uppercase;
   }
   .experience-date {
      font-family: 'Maven Pro';
      font-style: normal;
      font-weight: bold;
      font-size: 12px;
      line-height: 14px;
      letter-spacing: 0.26em;
      text-transform: uppercase;
      color: ${theme.colors.textColor4};
      margin: 0;
   }
   @media (min-width: 769px) {
      .exp-info {
         font-weight: 600;
      }
      .duration {
         span {
            font-size: ${theme.sizes.h8};
         }
      }
      .book-exp {
         font-size: ${theme.sizes.h8};
      }
   }
`
