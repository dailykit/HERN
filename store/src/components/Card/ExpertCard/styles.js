import styled from 'styled-components'
import { theme } from '../../../theme'

export const Card = styled.div`
   display: flex;
   flex-direction: column;
   align-items: flex-start;
   background: ${theme.colors.mainBackground};
   box-shadow: ${({ boxShadow = true }) =>
      boxShadow ? '0px 8px 12px 2px rgba(0, 0, 0, 0.32)' : 'none'};
   overflow: hidden;
   transition: all 0.3s ease-in-out;
   &:hover {
      box-shadow: ${({ boxShadow = true }) =>
         !boxShadow ? '0px 8px 12px 2px rgba(0, 0, 0, 0.32)' : 'none'};
      transform: translate3d(0px, -1.5px, 0px);
   }
   height: 480px;
   @media (min-width: 769px) {
      height: 580px;
   }
`

export const CardImage = styled.div`
   position: relative;
   width: 100%;
   height: 100%;
   border-radius: 16px;
   overflow: hidden;
   :hover {
      cursor: pointer;
   }
   img {
      width: 100%;
      height: 100%;
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
   padding: 0.75rem 0.5rem;
   .exp-name {
      margin: 2px 0;
      font-family: Proxima Nova;
      color: ${theme.colors.textColor4};
      font-weight: 700;
      text-align: left;
      letter-spacing: 0.16em;
      :hover {
         color: ${theme.colors.textColor};
         cursor: pointer;
      }
   }
   .category {
      text-align: left;
      font-weight: 800;
      font-family: Proxima Nova;
      letter-spacing: 0.16em;
      color: ${theme.colors.textColor};
   }
   .experience {
      text-align: left;
      font-weight: 400;
      font-size: ${theme.sizes.h7};
      font-style: italic;
      margin: 8px 0;
   }
   .viewProfileBtn {
      border: none;
      text-align: left;
      text-transform: uppercase;
      font-weight: 800;
      font-size: ${theme.sizes.h6};
      color: ${theme.colors.textColor};
      background: none;
      cursor: pointer;
   }
`
