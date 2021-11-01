import styled from 'styled-components'
import { theme } from '../../../theme'
export const Card = styled.div`
   display: flex;
   flex-direction: column;
   align-items: flex-start;
   box-shadow: ${({ boxShadow = true }) =>
      boxShadow
         ? '0px 8px 12px 2px rgba(0, 0, 0, 0.32)'
         : 'none' || '0px 8px 12px 2px rgba(0, 0, 0, 0.32)'};
   cursor: pointer;
   overflow: hidden;
   transition: all 0.3s ease-in-out;
   &:hover {
      transform: translate3d(0px, -1.5px, 0px);
   }
   max-height: 480px;
   border-radius: 24px 24px 0px 0px;
   width: ${({ customWidth }) => customWidth};
   @media (min-width: 769px) {
      max-height: 580px;
   }
`

export const CardImage = styled.div`
   position: relative;
   width: 100%;
   height: 360px;
   border-radius: 24px;
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
   .bookmark-icon {
      position: absolute;
      top: -4px;
      right: 16px;
      z-index: 3;
      &:hover {
         svg {
            height: 32px;
         }
      }
   }
   .in-action {
      transform: rotate(0deg);
      animation: animateHeart 1.2s infinite;
      @keyframes animateHeart {
         0% {
            transform: rotate(0deg) scale(0.8);
         }
         5% {
            transform: rotate(0deg) scale(0.9);
         }
         10% {
            transform: rotate(0deg) scale(0.8);
         }
         15% {
            transform: rotate(0deg) scale(1);
         }
         50% {
            transform: rotate(0deg) scale(0.8);
         }
         100% {
            transform: rotate(0deg) scale(0.8);
         }
      }
   }
`

export const CardBody = styled.div`
   color: ${({ backgroundMode = 'dark' }) =>
      backgroundMode === 'light'
         ? theme.colors.textColor5
         : theme.colors.textColor4};
   width: 100%;
   padding: 0.5rem;
   font-family: 'Maven Pro';
   &:hover {
      .book-exp {
         animation: tracking-in-contract 0.8s
            cubic-bezier(0.215, 0.61, 0.355, 1) both;
         @keyframes tracking-in-contract {
            0% {
               letter-spacing: 1em;
               opacity: 0;
            }
            40% {
               opacity: 0.6;
            }
            100% {
               letter-spacing: normal;
               opacity: 1;
            }
         }
      }
   }
   .book-exp {
      text-align: center;
      font-family: 'Maven Pro';
      font-size: ${theme.sizes.h8};
      color: ${theme.colors.tertiaryColor};
      text-transform: uppercase;
      cursor: pointer;
      animation: tracking-out-contract 0.7s
         cubic-bezier(0.55, 0.085, 0.68, 0.53) both;
      @keyframes tracking-out-contract {
         0% {
            opacity: 1;
         }
         50% {
            opacity: 1;
         }
         100% {
            letter-spacing: -0.5em;
            opacity: 0;
         }
      }
   }
   .exp-name {
      margin: 4px 0 4px 0;
      font-family: 'Maven Pro';
      font-weight: 800;
      text-align: left;
      color: ${({ backgroundMode = 'dark' }) =>
         backgroundMode === 'light'
            ? theme.colors.textColor5
            : theme.colors.textColor4};
      letter-spacing: 0.16em;
      :hover {
         color: ${theme.colors.textColor};
      }
   }
   .exp-info {
      font-weight: 800;
      font-size: ${theme.sizes.h7};
      margin-bottom: 0;
      span {
         font-weight: 400;
         font-size: ${theme.sizes.h7};
      }
   }
   .exp-users-info {
      font-weight: 600;
      font-size: ${theme.sizes.h6};
      margin-left: 8px;
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
      position: relative;
      width: 100%;
      display: flex;
      align-items: center;
      p {
         font-family: 'Maven Pro';
         color: ${theme.colors.textColor};
         font-weight: 800;
         letter-spacing: 0.16em;
         margin-bottom: 0;
      }
   }
   .expert-img {
      width: 14px;
      height: 14px;
      border-radius: 50px;
      margin-right: 8px;
   }
   @media (min-width: 769px) {
      .exp-name {
         margin: 0 0 0.5rem 0;
         font-family: 'Maven Pro';
      }
      .exp-info {
         font-size: ${theme.sizes.h8};
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
      .expert-img {
         width: 24px;
         height: 24px;
      }
   }
`
