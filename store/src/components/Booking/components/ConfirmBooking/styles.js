import styled from "styled-components";
import { theme } from "../../../../theme";
export const Wrap = styled.div`
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
  .payment-head {
    font-size: ${theme.sizes.h9};
    font-weight: 700;
    color: ${theme.colors.textColor};
    cursor: pointer;
    text-align: right;
    &:hover {
      text-decoration: underline;
    }
  }
  .counter-wrap {
    background: ${theme.colors.mainBackground};
    box-shadow: 1px 1px 2px rgba(50, 56, 72, 0.3),
      -1px -1px 2px rgba(17, 19, 24, 0.5),
      inset -5px 5px 10px rgba(17, 19, 24, 0.2),
      inset 5px -5px 10px rgba(17, 19, 24, 0.2),
      inset -5px -5px 10px rgba(50, 56, 72, 0.9),
      inset 5px 5px 13px rgba(17, 19, 24, 0.9);
    border-radius: 4px;
    padding: 1rem 0;
    input[type="number"]::-webkit-inner-spin-button,
    input[type="number"]::-webkit-outer-spin-button {
      -webkit-appearance: none;
      -moz-appearance: none;
      appearance: none;
      margin: 0;
    }
    .participant_input {
      background: ${theme.colors.mainBackground};
      font-size: ${theme.sizes.h3};
      font-weight: 700;
      color: ${theme.colors.textColor4};
      text-align: center;
      border: none;
      padding: 10px;
      border-bottom: 1px solid ${theme.colors.textColor4};
      &:focus {
        outline: 2px solid ${theme.colors.textColor4};
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
    background: ${theme.colors.mainBackground};
    box-shadow: -3px 3px 6px rgba(21, 23, 30, 0.2),
      3px -3px 6px rgba(21, 23, 30, 0.2), -3px -3px 6px rgba(45, 51, 66, 0.9),
      3px 3px 8px rgba(21, 23, 30, 0.9), inset 1px 1px 2px rgba(45, 51, 66, 0.3),
      inset -1px -1px 2px rgba(21, 23, 30, 0.5);
    border-radius: 4px;
    padding: 1rem;
    .checkbox-label {
      margin-left: 1rem;
      font-size: ${theme.sizes.h6};
      font-weight: 500;
      color: ${theme.colors.textColor4};
    }
  }
  .booking-info {
    padding: 1rem;
    background: ${theme.colors.mainBackground};
    box-shadow: -1px 1px 2px rgba(27, 30, 39, 0.2),
      1px -1px 2px rgba(27, 30, 39, 0.2), -1px -1px 2px rgba(39, 44, 57, 0.9),
      1px 1px 3px rgba(27, 30, 39, 0.9), inset 1px 1px 2px rgba(39, 44, 57, 0.3),
      inset -1px -1px 2px rgba(27, 30, 39, 0.5);
    border-radius: 4px;
    p {
      font-size: ${theme.sizes.h6};
      color: ${theme.colors.textColor4};
      line-height: ${theme.sizes.h3};
    }
  }
  .counter-update {
    padding: 1rem;
    margin: 28px 0;
    background: ${theme.colors.mainBackground};
    box-shadow: -1px 1px 2px rgba(27, 30, 39, 0.2),
      1px -1px 2px rgba(27, 30, 39, 0.2), -1px -1px 2px rgba(39, 44, 57, 0.9),
      1px 1px 3px rgba(27, 30, 39, 0.9), inset 1px 1px 2px rgba(39, 44, 57, 0.3),
      inset -1px -1px 2px rgba(27, 30, 39, 0.5);
    border-radius: 4px;
    .customCounterBtn {
      position: relative;
      svg {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        display: block;
      }
    }
    p {
      font-size: ${theme.sizes.h6};
      color: ${theme.colors.textColor4};
      line-height: ${theme.sizes.h3};
    }
    small {
      font-size: ${theme.sizes.h7};
      font-weight: 300;
      color: ${theme.colors.textColor4};
    }
    .guest-count {
      font-size: ${theme.sizes.h2};
      font-weight: 700;
      color: ${theme.colors.textColor4};
    }
  }
  .update-address {
    padding: 1rem 0;
    color: ${theme.colors.textColor};
    .change-head {
      color: ${theme.colors.textColor};
      cursor: pointer;
      &:hover {
        text-decoration: underline;
      }
    }
  }
  .change-head {
    color: ${theme.colors.textColor};
    cursor: pointer;
    &:hover {
      text-decoration: underline;
    }
  }
  .table-wrap {
    font-size: ${theme.sizes.h6};
    font-weight: 500;
    margin-bottom: 2rem;
    color: ${theme.colors.textColor4};
    table {
      width: 100%;
      td {
        text-align: left;
        padding: 8px;
      }
      td:nth-child(even) {
        text-align: right;
      }
    }
  }
  .points-wrap {
    margin-bottom: 2rem;
    .extra-pts-wrap {
      margin-bottom: 1rem;
      color: ${theme.colors.textColor4};
      padding: 1rem;
      background: ${theme.colors.mainBackground};
      box-shadow: -3px 3px 6px rgba(21, 23, 30, 0.2),
        3px -3px 6px rgba(21, 23, 30, 0.2), -3px -3px 6px rgba(45, 51, 66, 0.9),
        3px 3px 8px rgba(21, 23, 30, 0.9),
        inset 1px 1px 2px rgba(45, 51, 66, 0.3),
        inset -1px -1px 2px rgba(21, 23, 30, 0.5);
      border-radius: 4px;
      p {
        font-size: ${theme.sizes.h6};
        font-weight: 500;
      }
      small {
        font-size: ${theme.sizes.h7};
        font-weight: 300;
        color: ${theme.colors.textColor4};
        font-style: italic;
      }
      h1 {
        font-size: ${theme.sizes.h3};
        font-weight: 700;
        color: ${theme.colors.textColor4};
      }
    }
  }
  .coupon-wrapper {
    margin: 0 1rem;
    margin-bottom: 2rem;
    padding: 8px;
    border: 1px solid ${theme.colors.textColor};
    color: ${theme.colors.textColor};
    h1 {
      font-size: ${theme.sizes.h8};
      font-weight: 700;
    }
    small {
      font-size: ${theme.sizes.h7};
      font-weight: 300;
      font-style: italic;
    }
  }
  .total-sum {
    font-size: ${theme.sizes.h4};
    font-weight: 700;
    color: ${theme.colors.textColor4};
    margin: 0 1rem;
    margin-bottom: 1rem;
  }
  .add-address-p {
    font-size: ${theme.sizes.h7};
    font-weight: 500;
    color: ${theme.colors.textColor4};
    margin: 2rem 1rem 1rem;
  }
  .address-div {
    font-size: ${theme.sizes.h7};
    font-weight: 500;
    color: ${theme.colors.textColor4};
    background: ${theme.colors.mainBackground};
    border: 1px solid rgba(255, 255, 255, 0.05);
    box-sizing: border-box;
    border-radius: 4px;
    padding: 1rem;
    margin: 1rem 0;
    position: relative;
    small {
      font-size: 10px;
      font-style: italic;
    }
    .card_brand {
      margin-bottom: 4px;
      font-size: 14px;
      font-weight: 600;
    }
  }
`;
