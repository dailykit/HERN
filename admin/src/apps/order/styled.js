import { Tunnel } from '@dailykit/ui'
import styled, { css } from 'styled-components'

export const StyledWrapper = styled.div(
   ({ position, view }) => css`
      display: grid;
      height: calc(100vh - 40px);
      overflow: hidden;
      grid-template-rows: 1fr 40px;
      grid-template-areas: ${position === 'left'
         ? view === 'SUMMARY'
            ? '"main main" "footer footer"'
            : '"aside main" "footer footer"'
         : '"main aside" "footer footer"'};
      grid-template-columns: ${position === 'left' ? '340px 1fr' : '1fr 340px'};

      > aside {
         grid-area: aside;
         overflow-y: auto;
      }
      > button {
         grid-area: bottomBar;
      }
      > main {
         grid-area: main;
         overflow-y: auto;
         scroll-behavior: smooth;
         height: 100%;
      }
      > footer {
         grid-area: footer;
      }
      @media only screen and (max-width: 767px) {
         grid-template-columns: ${position === 'left'
            ? '240px 1fr'
            : '1fr 240px'};
      }
      @media only screen and (max-width: 1439px) and (orientation: landscape) {
         > main > main > div > section {
            width: calc(100vw - 340px);
         }
      }
      @media only screen and (max-width: 767px) and (orientation: landscape) {
         > main > main > div > section {
            width: calc(100vw - 240px);
         }
      }
      @media only screen and (orientation: portrait) {
         grid-template-areas: 'main' 'bottomBar' 'footer';
         grid-template-columns: 100%;
         grid-template-rows: 1fr 80px 40px;
         > main {
            height: calc(100vh - 230px);
         }
      }
   `
)

export const StyledTunnel = styled(Tunnel)`
   width: 100vw;
   overflow-y: auto;
`

export const Spacer = styled.div(
   ({ size, xAxis }) => css`
      flex-shrink: 0;
      ${xAxis ? `width: ${size};` : `height: ${size};`}
   `
)
export const OrderSummaryTunnel = styled.div`
   display: none;
   @media (orientation: portrait) {
      display: block;
   }
`
