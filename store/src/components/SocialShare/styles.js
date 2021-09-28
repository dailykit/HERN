import styled from "styled-components";
import { theme } from "../../theme";

export const Wrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-evenly;
  .share-icon {
    background: ${theme.colors.textColor4};
    width: 40px;
    height: 40px;
    border-radius: 8px;
    &:hover {
      cursor: pointer;
      svg {
        width: 44px;
        height: 44px;
      }
    }
  }
`;
