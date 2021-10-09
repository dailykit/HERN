import styled from 'styled-components'
import { theme } from '../../theme'

export const Wrapper = styled.div`
   margin-bottom: 32px;
   &:last-child {
      margin-bottom: 0;
   }
   .response-head {
      font-size: ${theme.sizes.h3};
      font-weight: 400;
      color: ${theme.colors.textColor4};
      margin-bottom: 1rem;
   }
   .icon-span {
      background: ${theme.colors.textColor4};
      border-radius: 50%;
      height: 28px;
      width: 28px;
      margin-right: 12px;
      cursor: pointer;
   }
   .flex-container {
      display: flex;
      flex-direction: column;
      width: 100%;
   }
   .card-wrap {
      width: auto;
      margin-bottom: 1rem;
   }
   .invite-response-div {
      padding: 0 1rem;
      color: ${theme.colors.textColor4};
      width: 100%;

      .response-row-div {
         display: flex;
         flex-direction: row;
         flex: 1;
         align-items: center;
         justify-content: space-between;
         border-bottom: 1px solid rgba(0, 0, 0, 0.15);
         padding: 1rem 0;
         .serial-no {
            font-size: ${theme.sizes.h8};
            font-weight: 400;
            color: ${theme.colors.textColor4};
            margin-right: 12px;
            flex-grow: 0;
         }
         .kit-icon {
            margin: 0 8px;
         }
         .icon-span {
            background: ${theme.colors.textColor4};
            border-radius: 50%;
            height: 28px;
            width: 28px;
            margin-right: 12px;
         }
         .respondee {
            font-size: ${theme.sizes.h6};
            font-weight: 400;
            color: ${theme.colors.textColor4};
            flex: 1;
            margin-right: 1rem;
         }
         .respondee-name {
            font-weight: 600;
         }
         .respondee-response {
            font-style: italic;
            color: ${theme.colors.textColor};
         }
         .admin-tag {
            font-size: ${theme.sizes.h11};
            background: rgba(53, 59, 77, 0.9);
            border-radius: 5px;
            padding: 6px;
            margin-left: 6px;
            font-weight: 400;
            text-transform: uppercase;
         }
         .kit-info {
            font-weight: 500;
            font-style: italic;
            color: ${theme.colors.textColor};
            display: block ruby;
         }
         .empty {
            background: ${theme.colors.emptyCellColor};
            border-radius: 8px;
            flex: 1;
            height: 20px;
         }
         .row-content-mv-wrap {
            display: flex;
            flex-direction: row;
            margin-bottom: 8px;
            flex: 1;
         }
         .response-inside-wrap {
            display: flex;
            flex-direction: column;
            flex: 1;
            @media (min-width: 769px) {
               flex-direction: row;
            }
         }
      }
   }

   @media (min-width: 769px) {
      .flex-container {
         flex-direction: row;
         width: 100%;
         height: 100%;
      }
      .card-wrap {
         width: 371px;
         height: 100%;
      }
   }
`
