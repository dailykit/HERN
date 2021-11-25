import styled from 'styled-components'
import { theme } from '../../theme'

export const InlineStyledWrapper = styled.div`
   width: 100%;
   height: inherit;
   display: flex;
   align-items: center;
   justify-content: center;
`
export const StyledWrapper = styled(InlineStyledWrapper)`
   height: 100vh;
   background: ${theme.colors.darkBackground.darkblue};
`
export const InlineStyledLoader = styled.div`
   display: inline-block;
   position: relative;
   width: 80px;
   height: 80px;
   > div {
      position: absolute;
      top: 33px;
      width: 13px;
      height: 13px;
      border-radius: 50%;
      background: ${({ color = theme.colors.textColor }) => color};
      animation-timing-function: cubic-bezier(0, 1, 1, 0);
   }
   div:nth-child(1) {
      left: 8px;
      animation: lds-ellipsis1 0.6s infinite;
   }
   div:nth-child(2) {
      left: 8px;
      animation: lds-ellipsis2 0.6s infinite;
   }
   div:nth-child(3) {
      left: 32px;
      animation: lds-ellipsis2 0.6s infinite;
   }
   div:nth-child(4) {
      left: 56px;
      animation: lds-ellipsis3 0.6s infinite;
   }
   @keyframes lds-ellipsis1 {
      0% {
         transform: scale(0);
      }
      100% {
         transform: scale(1);
      }
   }
   @keyframes lds-ellipsis3 {
      0% {
         transform: scale(1);
      }
      100% {
         transform: scale(0);
      }
   }
   @keyframes lds-ellipsis2 {
      0% {
         transform: translate(0, 0);
      }
      100% {
         transform: translate(24px, 0);
      }
   }
`

export const StyledLoader = styled(InlineStyledLoader)`
   display: block;
   position: absolute;
   top: 50%;
   left: 50%;
   transform: translate(-50%, -50%);
`

export const FlamingoLoader = styled.img`
   display: block;
   position: absolute;
   top: 50%;
   left: 50%;
   transform: translate(-50%, -50%);
   width: 260px;
`
