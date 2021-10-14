import styled from 'styled-components'
import { theme } from '../../../../theme'

export const OptionDiv = styled.div`
   .slot-div {
      padding: 1rem;
      margin: 1rem;
      background: ${theme.colors.lightBackground.grey};
      border-radius: 12px;
   }
   .proxinova_text {
      font-family: Proxima Nova;
      font-style: normal;
      font-weight: 600;
      letter-spacing: 0;
      color: ${theme.colors.textColor5};
      margin-bottom: 0 !important;
   }

   .slots-wrapper {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 1rem;
   }
   .slot-info-time {
      font-weight: 500;
   }
   .vote-head {
      color: ${theme.colors.textColor};
      position: relative;
      display: inline;

      &:after {
         position: absolute;
         bottom: 0;
         left: 0;
         right: 0;
         margin: auto;
         width: 0;
         content: '';
         color: ${theme.colors.textColor};
         background: ${theme.colors.textColor};
         height: 2px;
      }
      &:hover {
         cursor: pointer;
         &:after {
            width: 100%;
         }
      }
   }
   .vote-head,
   .vote-head:before,
   .vote-head:after {
      transition: all 560ms;
   }
   .booking-div {
      display: flex;
      align-items: center;
      justify-content: center;
      .book-slot {
         background: none;
         border: 1px solid ${theme.colors.textColor4};
         :hover {
            border: 1px solid ${theme.colors.textColor};
         }
         span {
            color: ${theme.colors.textColor};
            font-family: Proxima Nova;
            font-style: normal;
            letter-spacing: 0;
         }
      }
   }

   .voters-div {
      padding: 1rem 2rem;
      margin-bottom: 1rem;
      color: ${theme.colors.textColor5};
      .heading-h1 {
         font-weight: 600;
         font-size: ${theme.sizes.h3};
         color: ${theme.colors.textColor};
         margin-bottom: 1rem;
         position: sticky;
         top: 0;
      }
      .voter-info {
         font-size: ${theme.sizes.h8};
         color: ${theme.colors.textColor4};
         display: flex;
         justify-content: space-between;
         margin: 1rem 0;
         span {
            margin-right: 4px;
         }
      }
   }
`
export const VotersDiv = styled.div`
   padding: 1rem 2rem;
   margin-bottom: 1rem;
   .heading-h1 {
      font-weight: 600;
      font-size: ${theme.sizes.h3};
      color: ${theme.colors.textColor};
      margin-bottom: 1rem;
      position: sticky;
      top: 0;
      background: ${theme.colors.mainBackground};
   }
   .voter-info {
      font-size: ${theme.sizes.h8};
      color: ${theme.colors.textColor4};
      display: flex;
      justify-content: space-between;
      margin: 1rem 0;
      span {
         margin-right: 4px;
      }
   }
`
