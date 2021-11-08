import styled from 'styled-components'
import { theme } from '../../theme'

export const Wrapper = styled.div`
   padding: 1rem 0;
   .invite-create_at {
      margin: 1rem;
      font-size: ${theme.sizes.h8};
      font-weight: 600;
      color: ${theme.colors.textColor4};
   }
   .invite-p-head {
      font-size: ${theme.sizes.h7};
      font-weight: 300;
      font-style: italic;
      color: ${theme.colors.textColor4};
      margin: 20px 0;
      text-align: center;
   }
   .slot-div {
      padding: 1rem;
      margin: 1rem;
      background: ${theme.colors.mainBackground};
      box-shadow: -3px 3px 6px rgba(21, 23, 30, 0.2),
         3px -3px 6px rgba(21, 23, 30, 0.2), -3px -3px 6px rgba(45, 51, 66, 0.9),
         3px 3px 8px rgba(21, 23, 30, 0.9),
         inset 1px 1px 2px rgba(45, 51, 66, 0.3),
         inset -1px -1px 2px rgba(21, 23, 30, 0.5);
      border-radius: 12px;
   }
   .slot-info-head {
      font-size: ${theme.sizes.h8};
      font-weight: 700;
      color: ${theme.colors.textColor4};
   }
   .slot-info-time {
      font-size: ${theme.sizes.h8};
      font-weight: 500;
      color: ${theme.colors.textColor4};
   }
   .vote-head {
      font-size: ${theme.sizes.h8};
      font-weight: 500;
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
   .expiry-head {
      font-size: ${theme.sizes.h7};
      font-weight: 400;
      font-style: italic;
      color: ${theme.colors.textColor4};
   }
   .back-to-home {
      font-size: ${theme.sizes.h8};
      font-weight: 700;
      color: ${theme.colors.textColor};
      text-decoration: none;
      text-align: center;
      margin-bottom: 2rem;
      display: block;
   }

   .last-msg {
      color: ${theme.colors.textColor4};
      font-size: ${theme.sizes.h9};
      font-weight: 300;
      text-align: center;
      margin: 1rem 0 5rem 0;
   }

   .slots-wrapper {
      display: flex;
      align-items: center;
      justify-content: space-between;
   }
   .slots-wrapper-1 {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin: 1rem;
   }

   .card-container {
      background: ${theme.colors.textColor4};
   }
   .card-container > .ant-tabs-card .ant-tabs-content > .ant-tabs-tabpane {
      padding: 16px;
      background: '${theme.colors.textColor4}';
   }
   .card-container > .ant-tabs-card > .ant-tabs-nav::before {
      display: none;
   }
   .card-container > .ant-tabs-card .ant-tabs-tab {
      background: ${theme.colors.textColor4};
      > .ant-tabs-tab-btn {
         color: ${theme.colors.textColor};
         font-size: ${theme.sizes.h4};
         font-family: 'Barlow Condensed';
      }
   }
   .card-container > .ant-tabs-card .ant-tabs-tab-active {
      background: ${theme.colors.textColor};
      > .ant-tabs-tab-btn {
         color: ${theme.colors.textColor4};
      }
   }

   @media (min-width: 769px) {
      .invite-p-head {
         font-size: ${theme.sizes.h9};
         font-weight: 500;
      }
      .back-to-home {
         font-size: ${theme.sizes.h4};
      }
      .or {
         font-size: ${theme.sizes.h9};
      }
      .last-msg {
         font-size: ${theme.sizes.h4};
         font-weight: 500;
      }
   }
`

export const GridView = styled.div`
   display: flex;
   justify-content: center;
   justify-items: center;
   align-items: center;
   @media (min-width: 769px) {
      display: flex;
      width: 350px;
      height: 350px;
      margin: 0 auto 1rem auto;
      justify-content: center;
      align-items: center;
   }
`
