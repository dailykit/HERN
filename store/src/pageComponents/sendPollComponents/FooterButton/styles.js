import styled from 'styled-components'
import { theme } from '../../../theme'
export const FooterBtnWrap = styled.div`
   display: flex;
   align-items: center;
   position: sticky;
   bottom: 0px;
   left: 0;
   z-index: 5;
   width: 100%;
   padding: 1rem 0 0 0;
   background-color: ${theme.colors.textColor4};

   .nextBtn {
      height: 48px;
      background: ${theme.colors.textColor};
      color: ${theme.colors.textColor4};
      border-radius: 8px;
      font-family: 'Barlow Condensed';
      letter-spacing: 0.04em;
      &:disabled {
         background: ${theme.colors.textColor};
         height: 48px;
         cursor: not-allowed;
      }
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
`
