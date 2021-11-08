import styled from 'styled-components'
import { theme } from '../../theme'
export const Wrapper = styled.div`
   width: 100%;
   margin-bottom: 1rem;
   padding: ${({ type }) => (type === 'tunnel' ? '1rem' : '0')};
   overflow-y: auto;
   .ghost {
      color: ${theme.colors.textColor4};
      width: 100%;
      display: flex;
      align-items: flex-end;
      padding: 6px;
      cursor: pointer;
      &:hover {
         color: ${theme.colors.textColor};
         svg {
            stroke: ${theme.colors.textColor};
         }
      }
      span {
         margin-left: 8px;
      }
   }
   .sticky-header {
      background: ${theme.colors.mainBackground};
      position: sticky;
      top: -1px;
      padding: 8px;
      z-index: 3;
   }
   .greet-msg {
      font-size: 32px;
      font-weight: 500;
      color: ${theme.colors.textColor4};
      margin-bottom: 2rem;
      text-align: center;
   }
   .custom-btn {
      width: auto;
      padding: 0 1rem;
      margin-bottom: 20px;
      background: ${theme.colors.textColor};
      border-radius: 24px;
      color: ${theme.colors.textColor4};
      font-family: 'Barlow Condensed';
      letter-spacing: 0.04em;
      height: 64px;
   }
   .grid-view {
      display: grid;
      grid-template-columns: repeat(1, minmax(240px, 1fr));
      grid-gap: 1rem;
      display: 100%;
   }
   .customButton {
      padding: 0 1rem;
      margin-bottom: 20px;
      background: ${theme.colors.textColor};
      border-radius: 8px;
      color: ${theme.colors.textColor4};
      font-family: 'Barlow Condensed';
      letter-spacing: 0.04em;
      height: 64px;
   }
   .empty_address_msg {
      text-align: center;
      color: ${theme.colors.textColor4};
      font-size: ${theme.sizes.h3};
   }
   .payment-card {
      width: 100%;
      position: relative;
      background: ${theme.colors.lightestGrey};
      min-height: 100px;
      margin-bottom: 1rem;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      border-radius: 24px;
      padding: 1rem;
      .checkbox-wrap {
         display: flex;
         flex-direction: column;
         align-items: center;
         color: ${theme.colors.textColor4};
         margin-right: 8px;
         cursor: pointer;
         small {
            margin-top: 4px;
         }
      }
      .checkbox-label {
         font-family: 'Maven Pro';
         font-weight: 800;
         letter-spacing: 0.6em;
         margin-left: 1rem;
         font-size: ${theme.sizes.h6};
         color: ${theme.colors.textColor5};
      }

      .delete-btn {
         position: absolute;
         bottom: 8px;
         right: 8px;
         cursor: pointer;
         display: flex;
         justify-content: center;
         align-items: center;
         padding: 4px;
         pointer-events: ${({ isDeleting }) => (isDeleting ? 'none' : 'unset')};
         &:hover {
            border: 1px solid ${theme.colors.textColor4};
         }
      }

      .flex-row {
         display: flex;
         align-items: center;
         justify-content: space-between;
         padding: 0 2rem;
      }
   }
   .payment-div {
      padding: 32px 0;
      .h3_head {
         font-family: 'Maven Pro';
         font-style: normal;
         font-weight: 600;
         letter-spacing: 0.3em;
         margin-bottom: 16px;
         color: ${theme.colors.textColor7};
      }
      .payment-icon-wrapper {
         display: flex;
         align-items: center;
         .payment-icon {
            margin-right: 8px;
         }
      }
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
   .card-container > .ant-tabs-card .ant-tabs-tab-disabled {
      background: ${theme.colors.lightBackground.grey};
      > .ant-tabs-tab-btn {
         color: ${theme.colors.textColor7};
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

   @media (max-width: 769px) {
      .customButton {
         margin-bottom: 64px;
         height: 48px;
      }
   }
`

export const NewPaymentCard = styled.div`
   width: 100%;
   position: relative;
   background: ${({ isDefault }) =>
      isDefault ? theme.colors.textColor : theme.colors.lightBackground.grey};
   min-height: 100px;
   margin-bottom: 1rem;
   display: flex;
   flex-direction: column;
   justify-content: space-between;
   border-radius: 24px;
   padding: 1rem;
   :hover {
      cursor: pointer;
   }
   .checkbox-wrap {
      display: flex;
      flex-direction: column;
      align-items: center;
      color: ${theme.colors.textColor4};
      margin-right: 8px;
      cursor: pointer;
      small {
         margin-top: 4px;
      }
   }
   .checkbox-label {
      font-family: 'Maven Pro';
      font-weight: 800;
      letter-spacing: 0.6em;
      margin-left: 1rem;
      font-size: ${theme.sizes.h6};
      color: ${theme.colors.textColor5};
   }

   .delete-btn {
      position: absolute;
      bottom: 8px;
      right: 8px;
      cursor: pointer;
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 4px;
      pointer-events: ${({ isDeleting }) => (isDeleting ? 'none' : 'unset')};
      &:hover {
         border: 1px solid ${theme.colors.textColor4};
      }
   }

   .default_text {
      color: ${({ isDefault }) =>
         isDefault ? theme.colors.textColor4 : theme.colors.textColor5};
      font-family: 'Maven Pro';
      font-weight: 800;
      letter-spacing: 0.6em;
   }
   .flex-row:first-child {
      margin-bottom: 1rem;
   }
   .flex-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 2rem;
   }
   .flex-col {
      display: flex;
      flex-direction: column;
      padding: 0 2rem;
   }
   .title {
      font-family: 'Maven Pro';
      font-weight: 600;
      letter-spacing: 0.3em;
      color: ${({ isDefault }) =>
         isDefault ? theme.colors.textColor4 : theme.colors.textColor5};
   }
   .value {
      font-family: 'Barlow Condensed';
      color: ${({ isDefault }) =>
         isDefault ? theme.colors.textColor4 : theme.colors.textColor5};
   }
`
