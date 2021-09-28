import styled from "styled-components";
import { theme } from "../../theme";

export const FooterWrapper = styled.footer`
  height: 64px;
  position: fixed;
  bottom: -2px;
  width: 100%;
  z-index: 2;
  display: none;
  align-items: center;
  padding: 1rem 2rem;
  box-shadow: 0px -6px 9px 3px rgba(0, 0, 0, 0.2);
  justify-content: space-between;
  background: ${theme.colors.mainBackground};
  @media (max-width: 768px) {
    display: block;
    background: ${theme.colors.mainBackground};
  }
  .nav-list {
    list-style: none;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0;
    margin: 0 auto;
  }
  .nav-list-item {
    list-style: none;
    padding: 12px;
    width: 20px;
    height: 20px;
    background: ${theme.colors.textColor};
    cursor: pointer;
  }
  .nav-list-item:hover,
  .nav-list-item.active {
    background: ${theme.colors.mainBackground};
    border: ${`1px solid ${theme.colors.textColor}`};
  }
`;
