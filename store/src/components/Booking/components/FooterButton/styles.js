import styled from 'styled-components'
import { theme } from '../../../../theme'
export const FooterBtnWrap = styled.div`
   display: flex;
   flex-direction: column;
   align-items: center;
   position: sticky;
   bottom: 0;
   left: 0;
   z-index: 5;
   width: 100%;
   background: ${theme.colors.textColor4};
   padding: 1rem 0;
   .show-more {
      font-size: ${theme.sizes.h8};
      padding: 8px 0;
      border: 0;
      background: none;
      color: ${theme.colors.textColor};
      margin: 8px 0;
   }
   .ghost-btn {
      height: 48px;
      width: auto;
      padding: 0 1rem;
      border-radius: 0px;
      background: ${theme.colors.textColor4};
      font-family: League-Gothic;
      letter-spacing: 0.04em;
      padding: 0 8px;
      color: ${theme.colors.textColor};
      :hover {
         background: ${theme.colors.lightBackground.grey};
      }
   }
   .nextBtn {
      height: 48px;
      border-radius: 0px;
      background: ${theme.colors.textColor};
      color: ${theme.colors.textColor4};
      font-family: League-Gothic;
      letter-spacing: 0.04em;
      padding: 0 8px;
      &:disabled {
         cursor: not-allowed;
      }
   }
   .previousBtn {
      margin: 0;
      position: -webkit-sticky;
      position: sticky;
      top: -1px;
      cursor: pointer;
   }
   .availableDate {
      height: 100%;
      overflow: auto;
   }
   .minHead {
      font-size: ${theme.sizes.h7};
      font-weight: 500;
   }
   .guest {
      font-size: ${theme.sizes.h8};
      font-weight: normal;
      display: inline-block;
   }
   .minCost {
      margin-left: 4px;
      display: inline-block;
      font-size: ${theme.sizes.h4};
      font-weight: normal;
   }
   @media (min-width: 769px) {
      bottom: 0;
      background: ${theme.colors.lightBackground.grey};
      padding: 1rem 0;
      .nextBtn {
         height: 64px;
      }
      .ghost-btn {
         background: ${theme.colors.lightBackground.grey};
         :hover {
            background: ${theme.colors.textColor4};
         }
      }
   }
`
