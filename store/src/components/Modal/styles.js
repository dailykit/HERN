import styled from 'styled-components'
import { theme } from '../../theme'
export const ModalDiv = styled.div`
   background: ${theme.colors.textColor4};
   .modal-header {
      padding: 2rem 2rem 0 2rem;
      display: flex;
      justify-content: space-between;
      .actionBtn {
         width: auto;
         padding: 0 1rem;
         height: 40px;
         border-radius: 8px;
         background: ${theme.colors.textColor};
         color: ${theme.colors.textColor4};
      }
      .cross {
         width: 40px;
         height: 40px;
         background: none;
         border: none;
         outline: none;
         position: relative;
         svg {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            display: block;
         }
         &:hover {
            cursor: pointer;
            animation: scale-up-center 0.4s cubic-bezier(0.39, 0.575, 0.565, 1)
               both;
         }
         &:active {
            animation: scale-down-center 0.4s
               cubic-bezier(0.25, 0.46, 0.45, 0.94) both;
         }
         @keyframes scale-up-center {
            0% {
               -webkit-transform: scale(0.5);
               transform: scale(0.5);
            }
            100% {
               -webkit-transform: scale(1);
               transform: scale(1);
            }
         }

         @keyframes scale-down-center {
            0% {
               -webkit-transform: scale(1);
               transform: scale(1);
            }
            100% {
               -webkit-transform: scale(0.5);
               transform: scale(0.5);
            }
         }
      }
      .circular {
         width: 40px;
         height: 40px;
         background: ${theme.colors.mainBackground};
         box-shadow: 1px 1px 2px rgba(53, 59, 77, 0.3),
            -1px -1px 2px rgba(13, 15, 19, 0.5),
            inset -1px 1px 2px rgba(13, 15, 19, 0.2),
            inset 1px -1px 2px rgba(13, 15, 19, 0.2),
            inset -1px -1px 2px rgba(53, 59, 77, 0.9),
            inset 1px 1px 3px rgba(13, 15, 19, 0.9);
         outline: none;
         border-radius: 50%;
         text-align: center;
         padding: 8px 0;
         cursor: pointer;
         border: none;
         position: relative;
         svg {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            display: block;
         }
         &:hover {
            box-shadow: 1px 1px 2px rgba(53, 59, 77, 0.3),
               -1px -1px 2px rgba(13, 15, 19, 0.5),
               inset -7px 7px 14px rgba(13, 15, 19, 0.2),
               inset 7px -7px 14px rgba(13, 15, 19, 0.2),
               inset -7px -7px 14px rgba(53, 59, 77, 0.9),
               inset 7px 7px 18px rgba(13, 15, 19, 0.9);
         }
         &:active {
            box-shadow: -1px -1px 2px rgba(53, 59, 77, 0.3),
               1px 1px 2px rgba(13, 15, 19, 0.5),
               inset 6px -6px 12px rgba(13, 15, 19, 0.2),
               inset -6px 6px 12px rgba(13, 15, 19, 0.2),
               inset 6px 6px 12px rgba(53, 59, 77, 0.9),
               inset -6px -6px 15px rgba(13, 15, 19, 0.9);
         }
      }
   }
   .modal-body {
      height: calc(100% - 72px);
      overflow: auto;
   }
`

export const StyledTitle = styled.h1`
   font-weight: 400;
   color: ${theme.colors.textColor};
   font-family: League-Gothic;
   font-size: 38px;
   margin: 0;
`
