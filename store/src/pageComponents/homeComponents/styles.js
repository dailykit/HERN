import styled from "styled-components";
import { theme } from "../../theme";

export const Wrapper = styled.div`
  display: ${({ shouldVisible }) => (shouldVisible ? "block" : "none")};
  width: 100%;
  height: 100%;
  .redirectClass {
    color: ${theme.colors.textColor};
    text-decoration: none;
    text-align: center;
    display: block;
    margin: 1rem 0 4rem 0;
    font-size: 20px;
    font-weight: 800;
    span {
      padding: 8px 0;
    }
  }
  .wrapper-div {
    padding: 16px;
    width: 100%;
  }
`;
