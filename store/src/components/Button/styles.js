import styled from 'styled-components'
import { theme } from '../../theme'

export const StyledButton = styled.button`
   width: 100%;
   font-size: ${({ fontSize }) => fontSize};
   height: ${({ height }) => height || '38px'};
   border-radius: 24px;
   text-align: center;
   text-transform: uppercase;
   color: ${({ textColor }) => textColor || theme.colors.textColor};
   background: ${({ backgroundColor }) =>
      backgroundColor || theme.colors.textColor4};
   border: none;
   cursor: pointer;

   &:hover {
      cursor: pointer;
   }
   &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
   }
`

export const CircularButton = styled.button`
   width: ${({ customWidth }) => customWidth || '44px'};
   height: ${({ customHeight }) => customHeight || '44px'};
   text-align: center;
   font-size: 20px;
   font-weight: 600;
   color: #fff;
   background: linear-gradient(135deg, #232732 0%, #1f232e 100%);
   box-shadow: -4px 4px 8px rgba(13, 15, 19, 0.2),
      4px -4px 8px rgba(13, 15, 19, 0.2), -4px -4px 8px rgba(53, 59, 77, 0.9),
      4px 4px 10px rgba(13, 15, 19, 0.9),
      inset 1px 1px 2px rgba(53, 59, 77, 0.3),
      inset -1px -1px 2px rgba(13, 15, 19, 0.5);
   border: 1px solid #212530;
   border-radius: 50%;
   position: relative;
   overflow: hidden;
   &:hover {
      cursor: pointer;
   }
   &:active {
      box-shadow: 1px 1px 2px rgba(53, 59, 77, 0.3),
         -1px -1px 2px rgba(13, 15, 19, 0.5),
         inset -3px 3px 6px rgba(13, 15, 19, 0.2),
         inset 3px -3px 6px rgba(13, 15, 19, 0.2),
         inset -3px -3px 6px rgba(53, 59, 77, 0.9),
         inset 3px 3px 8px rgba(13, 15, 19, 0.9);
   }
   &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
   }
   &:after {
      background: #fff;
      content: '';
      height: 155px;
      left: -75px;
      opacity: 0.3;
      position: absolute;
      border-radius: 50%;
      top: -50px;
      transform: rotate(0deg);
      transition: all 2s cubic-bezier(0.19, 1, 0.22, 1);
      width: 50px;
      z-index: 5;
   }
   &:hover {
      cursor: pointer;
      &:after {
         left: 120%;
         transition: all 2s cubic-bezier(0.19, 1, 0.22, 1);
      }
   }
   &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
   }
`
