import styled from 'styled-components'
import { theme } from '../../../../theme'

export const Wrapper = styled.div`
   filter: ${({ disabled }) => disabled && 'blur(4px)'};
   .invitation-div {
      margin: 0;
   }
   .invite-msg-div {
      color: ${theme.colors.textColor4};
      font-size: ${theme.sizes.h6};
      font-weight: 400;
      text-align: left;
      .invite-msg {
         margin-bottom: 12px;
      }
      a {
         color: ${theme.colors.textColor};
         text-decoration: none;
      }
   }

   .customBtn {
      padding: 0 1rem;
      margin-bottom: 20px;
      background: ${theme.colors.textColor};
      border-radius: 8px;
      color: ${theme.colors.textColor4};
      font-family: League-Gothic;
      letter-spacing: 0.04em;
      height: 48px;
      span {
         margin-right: 8px;
      }
   }
   .blink_me {
      animation: blinker 1s linear 1;
      @keyframes blinker {
         50% {
            opacity: 0;
         }
      }
   }

   .share-icon {
      background: ${theme.colors.textColor4};
      width: 40px;
      height: 40px;
      border-radius: 8px;
      &:hover {
         cursor: pointer;
         svg {
            width: 44px;
            height: 44px;
         }
      }
   }
   .or {
      color: ${theme.colors.textColor4};
      font-size: ${theme.sizes.h8};
      font-weight: 700;
      text-align: center;
      margin-bottom: 1rem;
   }
`
