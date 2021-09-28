import styled from "styled-components";
import { theme } from "../../theme";
export const CardWrapper = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  border-radius: 4px;
  .boldText {
    font-weight: 600;
  }
  .experience-info {
    display: flex;
    margin-top: 24px;
    img {
      width: 106px;
      height: 106px;
      border-radius: 4px;
      flex-grow: 0 !important;
      flex-shrink: 0 !important;
      overflow: hidden !important;
      object-fit: cover;
    }
    .experience-details {
      padding-left: 16px;
      flex: 1;
      color: ${theme.colors.textColor4};
    }
  }
  .price-details {
    display: flex;
    flex-direction: column;
    margin-top: 24px;
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
      .estimated-billing-details {
        table {
          width: 100%;
          margin: 8px 0;
          td:nth-child(2n) {
            text-align: right;
            padding: 8px;
          }
        }
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
    p {
      font-size: ${theme.sizes.h3};
      font-weight: 700;
      color: ${theme.colors.textColor4};
      text-align: center;
    }
  }
`;
