import styled from "styled-components";
import { theme } from "../../../../theme";

export const Wrapper = styled.div`
  width: 100%;
  .date-picker-class {
    width: 100%;
  }
  .select-dates {
    width: 100%;
    color: ${theme.colors.textColor4};
    border: 0;
    background: none;
    cursor: pointer;
    p {
      text-align: left;
    }
    .head {
      font-size: ${theme.sizes.h6};
      font-weight: 600;
    }
  }
`;
