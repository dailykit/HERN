import styled from "styled-components";
import { theme } from "../../../theme";

export const Wrap = styled.div`
  .product_wrapper {
    display: grid;
    grid-template-columns: repeat(1, 1fr);
    grid-gap: 1rem;
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
  .normal-p {
    margin: 0 1rem;
    font-size: ${theme.sizes.h6};
    color: ${theme.colors.textColor4};
    line-height: ${theme.sizes.h3};
  }
  .kit_heading {
    margin: 1rem 0;
    text-align: center;
    font-size: ${theme.sizes.h3};
    color: ${theme.colors.textColor4};
  }
  .change-head {
    color: ${theme.colors.textColor};
    cursor: pointer;
  }
  .address-wrapper {
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

  .address-div {
    font-size: ${theme.sizes.h7};
    font-weight: 500;
    color: ${theme.colors.textColor4};
    background: ${theme.colors.mainBackground};
    border: 1px solid rgba(255, 255, 255, 0.05);
    box-sizing: border-box;
    border-radius: 4px;
    padding: 20px 1rem 1rem 1rem;
    margin: 1rem 0;
    position: relative;
    small {
      position: absolute;
      top: 0px;
      left: 0px;
      font-size: 10px;
      background: #111;
      padding: 2px 6px;
    }
  }
`;
