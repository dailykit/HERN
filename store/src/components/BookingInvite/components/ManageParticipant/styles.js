import styled from 'styled-components'
import { theme } from '../../../../theme'

export const Wrapper = styled.div`
   .participant-email {
      font-family: Proxima Nova;
      font-style: normal;
      font-weight: 600;
      letter-spacing: 0.1em;
      color: ${theme.colors.textColor7};
      span {
         color: ${theme.colors.textColor7};
      }
   }
   .billing-action {
      display: flex;
      align-items: center;
      position: relative;
      text-decoration: none;
      font-family: Proxima Nova;
      font-style: normal;
      font-weight: 600;
      letter-spacing: 0.1em;
      color: ${theme.colors.textColor7};
      padding: 4px 0;

      &:after {
         position: absolute;
         bottom: 0;
         left: 0;
         right: 0;
         margin: auto;
         width: 0%;
         content: '';
         color: ${theme.colors.textColor7};
         background: ${theme.colors.textColor7};
         height: 2px;
      }
      &:hover {
         color: ${theme.colors.textColor7};
         cursor: pointer;
         &:after {
            width: 100%;
         }
      }
   }
   .billing-action,
   .billing-action:before,
   .billing-action:after {
      transition: all 560ms;
   }
   .svg-icon {
      margin-left: 16px;
   }

   .ant-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      :hover {
         background: ${theme.colors.lightBackground.grey};
      }
   }

   .hidden {
      display: none;
   }

   .show {
      transition: height 0.3s;
      display: block;
   }

   .billing-details {
      table {
         width: 100%;
         margin: 8px 0;
         td {
            font-family: Proxima Nova;
            font-style: normal;
            letter-spacing: 0.1em;
            color: ${theme.colors.textColor5};
            font-size: ${theme.sizes.h8};
         }
         tr:first-child {
            td {
               font-weight: 600;
            }
         }
      }
   }
`
