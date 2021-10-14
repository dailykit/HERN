import styled from 'styled-components'
import { theme } from '../../theme'

export const Wrapper = styled.div`
   width: 100%;
   margin: 1rem 0;
   .flexWrapper {
      display: 'flex';
      flex-direction: column;
      border-bottom: 1px solid ${theme.colors.textColor4};
   }
   .date {
      font-family: Proxima Nova;
      font-weight: 600;
      color: ${theme.colors.textColor5};
      margin-bottom: 12px;
      text-align: left;
   }
   .custom-slot-Btn {
      height: 36px;
      width: auto;
      text-transform: uppercase;
      padding: 0 1rem;
      font-family: League-Gothic;
      letter-spacing: 0.04em;
      &:active {
         animation: scale-down-center 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)
            both;
         @keyframes scale-down-center {
            0% {
               -webkit-transform: scale(1);
               transform: scale(1);
            }
            100% {
               -webkit-transform: scale(0.5);
               transform: scale(0.8);
            }
         }
      }
      .spanText {
         font-size: ${theme.sizes.h7};
         font-weight: 300;
         font-style: italic;
         margin-right: 4px;
      }
      .time {
         font-size: ${theme.sizes.h8};
         font-weight: 500;
      }
   }
   .selected_poll_btn {
      background: ${theme.colors.textColor} !important;
      color: ${theme.colors.textColor4} !important;
   }
   .poll_sold_out,
   .poll_expired,
   .poll_checkout {
      border: none;
      color: ${theme.colors.textColor4};
      background: ${theme.colors.disableBackground};
   }
   .sold_out,
   .expired {
      border: none;
      background: none;
      color: ${theme.colors.disableBackground};
   }
   .poll_choose {
      border: 1px solid ${theme.colors.textColor};
      background: ${theme.colors.textColor4};
      color: ${theme.colors.textColor};
   }
   .choose {
      background: ${theme.colors.textColor4};
      color: ${theme.colors.textColor};
   }

   .checkout {
      background: ${theme.colors.textColor};
      color: ${theme.colors.textColor4};
   }
   .time-info {
      font-family: League-Gothic;
      font-weight: 500;
      color: ${theme.colors.textColor5};
      text-transform: capitalize;
      letter-spacing: 0.04em;
   }
   .sold_out_text,
   expired_text {
      color: ${theme.colors.disableBackground};
   }
   .slot-wrapper {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 1rem;
   }
`
