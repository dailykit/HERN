import styled from 'styled-components'
import { theme } from '../../../../theme'

export const Wrapper = styled.div`
   width: 100%;
   position: relative;
   .select-participant {
      width: 100%;
      color: ${theme.colors.textColor7};
      border: 0;
      background: none;
      cursor: pointer;
      p {
         text-align: left;
         color: ${theme.colors.textColor7};
         font-family: Proxima Nova;
      }
      .head {
         color: ${theme.colors.textColor7};
         font-family: Proxima Nova;
      }
   }
`

export const Popup = styled.div`
   width: 100%;
   display: ${({ show }) => (show ? 'block' : 'none')};
   position: absolute;
   border-radius: 4px;
   right: 0;
   top: 68px;
   z-index: 10;
   background: ${theme.colors.textColor4};
   .pointer {
      position: absolute;
      pointer-events: none;
      border-style: solid;
      border-right-style: solid;
      border-bottom-style: solid;
      border-width: 1px;
      border-right-width: 1px;
      border-bottom-width: 1px;
      border-right: 1px solid rgb(203, 214, 226);
      border-bottom: 1px solid rgb(203, 214, 226);
      border-image: none 100% / 1 / 0 stretch;
      clip-path: polygon(100% 100%, 0px 100%, 100% 0px);
      border-top-left-radius: 100%;
      border-top-color: transparent !important;
      border-left-color: transparent !important;
      width: 15px;
      height: 15px;
      background-color: inherit;
      transform: rotate(-135deg);
      top: -6px;
      left: calc(50% - 10px);
      background: #fff;
   }
`
