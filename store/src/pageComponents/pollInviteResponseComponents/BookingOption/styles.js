import styled from 'styled-components'
import { theme } from '../../../theme'

export const OptionDiv = styled.div`
   .proxinova_text {
      font-family: Proxima Nova;
      font-style: normal;
      letter-spacing: 0;
      color: ${theme.colors.textColor5};
      margin-bottom: 0 !important;
   }
   .slot-div {
      display: flex;
      align-items: center;
      justify-content: space-between;
      color: ${theme.colors.textColor5};
      background: ${theme.colors.lightBackground.white};
      border-radius: 24px;
      padding: 1rem;
      margin-bottom: 12px;
      .checkbox-inp {
         cursor: pointer;
      }
      .slot-time {
         font-size: ${theme.sizes.h6};
         font-weight: 500;
         color: ${theme.colors.textColor5};
         margin-left: 8px;
      }
      .vote-count {
         font-size: ${theme.sizes.h11};
         font-weight: 400;
         font-style: italic;
         color: ${theme.colors.textColor4};
      }
   }
   .slots-wrapper {
      display: flex;
      align-items: center;
      justify-content: space-between;
   }
   .slot-info-time {
      margin-left: 1rem;
   }
   .vote-head {
      color: ${theme.colors.textColor};
   }
   .book-slot {
      text-align: center;
      font-weight: 800;
      font-size: ${theme.sizes.h8};
      color: ${theme.colors.tertiaryColor};
      text-transform: uppercase;
      cursor: pointer;
   }
`
