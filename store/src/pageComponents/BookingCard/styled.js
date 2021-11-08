import styled from 'styled-components'
import { theme } from '../../theme'

export const CardWrapper = styled.div`
   width: 100%;
   display: flex;
   flex-direction: column;
   border-radius: 40px;
   background: ${theme.colors.lightBackground.grey};
   .boldText {
      font-weight: 600;
   }
   .mavenPro_text {
      font-family: 'Maven Pro';
      font-style: normal;
      font-weight: 600;
      letter-spacing: 0.05em;
      color: ${theme.colors.textColor5};
      margin-bottom: 0 !important;
   }
   .exp_img {
      width: 100%;
      height: 180px;
      border-radius: 40px 40px 0 0;
      flex-grow: 0 !important;
      flex-shrink: 0 !important;
      overflow: hidden !important;
      object-fit: cover;
   }
   .divider {
      color: ${theme.colors.textColor7};
      border-top-color: ${theme.colors.textColor7};
      .ant-divider-inner-text {
         font-family: 'Maven Pro';
         font-style: normal;
         letter-spacing: 0.05em;
         font-size: ${theme.sizes.h8};
      }
   }
   .experience-info {
      display: flex;
      flex-direction: column;
      .experience-details {
         flex: 1;
         color: ${theme.colors.textColor5};
         .experience-heading {
            font-family: 'Maven Pro';
            font-style: normal;
            font-weight: 600;
            letter-spacing: 0.05em;
            margin: 8px 0;
            color: ${theme.colors.textColor7};
         }
         .experience-date {
            display: flex;
            align-items: center;
            justify-content: space-between;
            h2 {
               font-family: 'Barlow Condensed';
               letter-spacing: 0.04em;
               color: ${theme.colors.textColor5};
               margin-bottom: 0;
            }
         }
      }
   }
   .price-details {
      display: flex;
      flex-direction: column;
      .pricing {
         display: flex;
         align-items: center;
         justify-content: space-between;
         margin-top: 16px;
      }
      .estimate-billing-div {
         display: flex;
         flex-direction: column;
         margin: 1rem 0 0 0;
         cursor: pointer;
         .billing-action {
            color: ${theme.colors.textColor};
         }
      }
   }
   .booking-done {
      margin-top: 4rem;
      padding: 1rem;
      img {
         width: 94px;
         height: 94px;
         display: block;
         margin-left: auto;
         margin-right: auto;
      }
   }
   .full-payment-msg {
      font-family: 'Barlow Condensed';
      font-style: normal;
      letter-spacing: 0.04em;
      color: ${theme.colors.textColor};
      margin-top: 1rem;
      text-align: center;
      margin-bottom: 0;
   }
   .ant-collapse {
      background: none;
   }
   .ant-collapse {
      border: none;
      > .ant-collapse-item > .ant-collapse-header {
         padding: 0;
         font-family: 'Maven Pro';
         font-style: normal;
         font-weight: 600;
         letter-spacing: 0.05em;
         color: ${theme.colors.textColor};
         font-size: ${theme.sizes.h6};
         border: none;
      }
   }
   .ant-collapse-item {
      font-family: 'Maven Pro';
      font-style: normal;
      font-weight: 600;
      letter-spacing: 0.05em;
      color: ${theme.colors.textColor};
      font-size: ${theme.sizes.h6};
      border: none;
   }
   .ant-collapse-arrow {
      font-size: 18px;
      svg {
         color: ${theme.colors.textColor};
      }
   }

   .ant-collapse-content {
      background: none;
      > .ant-collapse-content-box {
         padding: 0;
         .estimated-billing-details {
            table {
               width: 100%;
               margin: 8px 0;
               td {
                  font-family: 'Maven Pro';
                  font-style: normal;
                  font-weight: 600;
                  letter-spacing: 0.05em;
                  color: ${theme.colors.textColor5};
                  font-size: ${theme.sizes.h8};
               }
               td:nth-child(2n) {
                  text-align: right;
                  padding: 8px;
               }
            }
         }
      }
   }
`
