import styled from "styled-components";
import { theme } from "../../../theme";
export const FooterBtnWrap = styled.div`
  display: flex;
  align-items: center;
  position: sticky;
  bottom: 0px;
  left: 0;
  z-index: 5;
  width: 100%;
  background: ${theme.colors.mainBackground};
  padding: 1rem 0;

  .nextBtn {
    height: 48px;
    font-size: ${theme.sizes.h8};
    padding: 0 8px;
    &:disabled {
      cursor: not-allowed;
    }
  }
  .previousBtn {
    margin: 0;
    position: -webkit-sticky;
    position: sticky;
    top: -1px;
    cursor: pointer;
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
`;
