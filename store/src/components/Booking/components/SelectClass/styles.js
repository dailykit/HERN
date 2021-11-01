import styled from 'styled-components'
import { theme } from '../../../../theme'
export const Wrapper = styled.div`
   .top-heading {
      font-size: ${theme.sizes.h3};
      font-weight: 400;
      color: ${theme.colors.textColor4};
      text-transform: uppercase;
      margin-bottom: 28px;
      text-align: center;
   }
   .heading {
      font-family: League-Gothic;
      color: ${theme.colors.textColor5};
      text-transform: uppercase;
      margin-bottom: 8px;
      text-align: left;
      span {
         font-size: ${theme.sizes.h6};
         font-weight: 500;
         color: ${theme.colors.textColor4};
         text-transform: lowercase;
      }
   }
   .sticky-container {
      position: sticky;
      top: -25px;
      z-index: 5;
      background: ${theme.colors.textColor4};
      padding: 1rem 0;
   }
   .select-option {
      display: flex;
      color: ${theme.colors.textColor4};
      border-radius: 4px;
      .select-dates {
         width: 100%;
         color: ${theme.colors.textColor4};
         border: 0;
         background: none;
         cursor: pointer;
         p {
            text-align: left;
         }
         .head {
            font-size: ${theme.sizes.h6};
            font-weight: 600;
         }
      }
      .select-participant {
         width: 100%;
         color: ${theme.colors.textColor4};
         border: 0;
         background: none;
         cursor: pointer;
         position: relative;
         p {
            text-align: left;
         }
         .head {
            font-size: ${theme.sizes.h6};
            font-weight: 600;
         }
      }
   }

   .showAll {
      font-size: ${theme.sizes.h7};
      font-weight: 200;
      font-style: italic;
      color: ${theme.colors.textColor4};
   }
   .calendarSpan {
      background: none;
      box-shadow: -3px 3px 6px rgba(21, 23, 30, 0.2),
         3px -3px 6px rgba(21, 23, 30, 0.2), -3px -3px 6px rgba(45, 51, 66, 0.9),
         3px 3px 8px rgba(21, 23, 30, 0.9),
         inset 1px 1px 2px rgba(45, 51, 66, 0.3),
         inset -1px -1px 2px rgba(21, 23, 30, 0.5);
      border-radius: 4px;
      padding: 8px;
   }
   .breakdown-head {
      background: none;
      border: none;
      font-family: 'Maven Pro';
      color: ${theme.colors.textColor7};
      cursor: pointer;
      margin-bottom: 1rem;
   }
   .availableDate {
      height: 230px;
      overflow-y: auto;
      margin-top: 1rem;
      .availableDate_head {
         font-family: 'Maven Pro';
         font-weight: 600;
         color: ${theme.colors.textColor7};
         margin-bottom: 2rem;
      }
   }
   .flex_row {
      display: flex;
      align-items: center;
      justify-content: space-between;
   }

   @media (min-width: 769px) {
      .sticky-container {
         top: -2rem;
         background: ${theme.colors.lightBackground.grey};
      }
   }
`

export const Popup = styled.div`
   display: ${({ show }) => (show ? 'block' : 'none')};
   position: absolute;
   border-radius: 4px;
   left: 0px;
   top: 32px;
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
      left: 16px;
      background: #fff;
   }
`
