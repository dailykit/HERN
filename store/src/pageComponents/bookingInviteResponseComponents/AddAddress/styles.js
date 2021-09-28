import styled from "styled-components";
import { theme } from "../../../theme";

export const Wrapper = styled.div`
  margin-top: 2rem;
  .normal-p {
    margin: 0 1rem;
    font-size: ${theme.sizes.h6};
    color: ${theme.colors.textColor4};
    line-height: ${theme.sizes.h3};
  }
  .change-head {
    color: ${theme.colors.textColor};
    cursor: pointer;
  }

  .address-div {
    padding: 1rem;
    margin: 1rem 0;
    .address-header {
      font-size: ${theme.sizes.h3};
      font-weight: 600;
      color: ${theme.colors.textColor};
      text-align: center;
    }
  }
  .address-wrapper {
    margin: 1rem 0;
    margin-bottom: 2rem;
    padding: 8px;
    border: 1px solid ${theme.colors.textColor};
    color: ${theme.colors.textColor};
    cursor: pointer;
  }
`;
