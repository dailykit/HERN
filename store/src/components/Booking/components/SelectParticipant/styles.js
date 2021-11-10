import styled from 'styled-components'
import { theme } from '../../../../theme'

export const Wrap = styled.div`
   width: 100%;
   padding: 0;
   .top-heading {
      font-size: ${theme.sizes.h3};
      font-weight: 400;
      color: ${theme.colors.textColor4};
      text-transform: uppercase;
      margin-bottom: 28px;
      text-align: center;
   }

   .showAll {
      font-size: ${theme.sizes.h7};
      font-weight: 200;
      font-style: italic;
      color: ${theme.colors.textColor4};
   }
   .small-head {
      font-size: ${theme.sizes.h8};
      font-weight: 400;
      color: ${theme.colors.textColor4};
   }
   .minGuest {
      font-size: ${theme.sizes.h8};
      font-weight: 700;
      color: ${theme.colors.textColor4};
   }
   .counter-head {
      font-size: ${theme.sizes.h8};
      font-weight: 700;
      color: ${theme.colors.textColor4};
      text-transform: uppercase;
   }
   .breakdown-head {
      font-size: ${theme.sizes.h6};
      font-weight: 700;
      color: ${theme.colors.textColor};
      cursor: pointer;
   }
   .counter-wrap {
      border-radius: 4px;
      padding: 1rem 0;
      input[type='number']::-webkit-inner-spin-button,
      input[type='number']::-webkit-outer-spin-button {
         -webkit-appearance: none;
         -moz-appearance: none;
         appearance: none;
         margin: 0;
      }
      .flex-row {
         display: flex;
         justify-content: space-between;
         align-items: center;
         .counter-btn {
            width: 25px;
            height: 25px;
            box-shadow: none;
            display: flex;
            align-items: center;
            justify-content: center;
            svg {
               stroke-width: 5px;
            }
            :hover {
               cursor: pointer;
               svg {
                  stroke: ${theme.colors.textColor};
               }
            }
         }
         .disabled {
            pointer-events: none;
         }
      }

      .participant_input {
         font-size: ${theme.sizes.h3};
         font-weight: 700;
         color: ${theme.colors.mainBackground};
         text-align: center;
         border: none;
         padding: 10px;
         width: 100%;
         max-width: 250px;
         background: transparent;
         margin: 0 0.5rem;
         &:focus {
            border-bottom: 2px solid ${theme.colors.textColor5};
         }
      }
   }
   .minGuest-b {
      font-size: ${theme.sizes.h2};
      font-weight: 700;
      color: ${theme.colors.textColor4};
   }
   .discount-info {
      text-align: right;
      font-size: ${theme.sizes.h6};
      font-weight: 500;
      color: ${theme.colors.tertiaryColor};
      margin: 10px 0;
   }
   .checkbox-wrap {
      display: flex;
      align-items: center;
      border-radius: 4px;
      width: 100%;
      .checkbox-label {
         margin-left: 1rem;
         color: ${theme.colors.textColor7};
         font-weight: 700;
         margin-bottom: 0;
         font-family: 'Maven Pro';
      }
   }

   .loader,
   .loader:before,
   .loader:after {
      border-radius: 50%;
      width: 24px;
      height: 24px;
      -webkit-animation-fill-mode: both;
      animation-fill-mode: both;
      -webkit-animation: load7 1.8s infinite ease-in-out;
      animation: load7 1.8s infinite ease-in-out;
   }
   .loader {
      background: linear-gradient(228.17deg, #7ab6d3 0.03%, #294460 95.55%);
      color: #191d28;
      font-size: 10px;
      margin: 80px auto;
      position: relative;
      text-indent: -9999em;
      -webkit-transform: translateZ(0);
      -ms-transform: translateZ(0);
      transform: translateZ(0);
      -webkit-animation-delay: -0.16s;
      animation-delay: -0.16s;
   }
   .loader:before,
   .loader:after {
      content: '';
      position: absolute;
      top: 0;
   }
   .loader:before {
      left: -3.5em;
      -webkit-animation-delay: -0.32s;
      animation-delay: -0.32s;
   }
   .loader:after {
      left: 3.5em;
   }
   @-webkit-keyframes load7 {
      0%,
      80%,
      100% {
         box-shadow: 0 2.5em 0 -1.3em;
      }
      40% {
         box-shadow: 0 2.5em 0 0;
      }
   }
   @keyframes load7 {
      0%,
      80%,
      100% {
         box-shadow: 0 2.5em 0 -1.3em;
      }
      40% {
         box-shadow: 0 2.5em 0 0;
      }
   }

   @media (max-width: 769px) {
      ${
         '' /* .counter-wrap {

      .flex-row {

         .counter-btn {

            svg {
               stroke-width: 5px;
               stroke: ${theme.colors.textColor7}
            }
            :hover {
               cursor: pointer;
               svg {
                  stroke: ${theme.colors.textColor};
               }
            }
         }
         .disabled {
            pointer-events: none;
         }

      } */
      }
   }
`
