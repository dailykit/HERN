import styled from "styled-components";
import { theme } from "../../../theme";

export const OptionDiv = styled.div`
  .slot-div {
    display: flex;
    align-items: center;
    justify-content: space-between;
    color: ${theme.colors.textColor4};
    background: ${theme.colors.mainBackground};
    box-shadow: -3px 3px 6px rgba(21, 23, 30, 0.2),
      3px -3px 6px rgba(21, 23, 30, 0.2), -3px -3px 6px rgba(45, 51, 66, 0.9),
      3px 3px 8px rgba(21, 23, 30, 0.9), inset 1px 1px 2px rgba(45, 51, 66, 0.3),
      inset -1px -1px 2px rgba(21, 23, 30, 0.5);
    border-radius: 4px;
    padding: 1rem;
    margin-bottom: 12px;
    .checkbox-inp {
      cursor: pointer;
    }
    .slot-time {
      font-size: ${theme.sizes.h6};
      font-weight: 500;
      color: ${theme.colors.textColor4};
      margin-left: 8px;
    }
    .vote-count {
      font-size: ${theme.sizes.h11};
      font-weight: 400;
      font-style: italic;
      color: ${theme.colors.textColor4};
    }
  }
  .slots-wrapper {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .slot-info-time {
    font-size: ${theme.sizes.h8};
    font-weight: 500;
    color: ${theme.colors.textColor4};
    margin-left: 1rem;
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
`;
