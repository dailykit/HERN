import styled from "styled-components";
import { theme } from "../../theme";
export const ModalDiv = styled.div`
  width: 580px;
  height: 780px;
  display: block;
  position: absolute;
  top: 0;
  right: 0;
  z-index: 15;
  background: ${theme.colors.mainBackground};
  box-shadow: -31px 31px 62px rgba(20, 23, 30, 0.2),
    -31px 39px 78px rgba(20, 23, 30, 0.9);
  animation: ${({ isOpen }) =>
    isOpen ? "slideIn 0.5s linear" : "slideOut 0.5s linear"};
  @keyframes slideIn {
    from {
      transform: translate3d(200%, 0px, 0px);
    }
    to {
      transform: translate3d(0%, 0px, 0px);
    }
  }

  @keyframes slideOut {
    from {
      transform: translate3d(0%, 0px, 0px);
    }
    to {
      transform: translate3d(200%, 0px, 0px);
    }
  }
  .modal-header {
    padding: 2rem 2rem 0 2rem;
    display: flex;
    justify-content: space-between;
    .actionBtn {
      width: auto;
      padding: 0 1rem;
      height: 40px;
      background: ${theme.colors.secondaryColor};
    }
    .closeBtn {
      width: 40px;
      height: 40px;
      background: ${theme.colors.mainBackground};
      box-shadow: 1px 1px 2px rgba(53, 59, 77, 0.3),
        -1px -1px 2px rgba(13, 15, 19, 0.5),
        inset -1px 1px 2px rgba(13, 15, 19, 0.2),
        inset 1px -1px 2px rgba(13, 15, 19, 0.2),
        inset -1px -1px 2px rgba(53, 59, 77, 0.9),
        inset 1px 1px 3px rgba(13, 15, 19, 0.9);
      outline: none;
      border-radius: 50%;
      text-align: center;
      padding: 8px 0;
      cursor: pointer;
      border: none;
      position: relative;
      svg {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        display: block;
      }
      &:hover {
        box-shadow: 1px 1px 2px rgba(53, 59, 77, 0.3),
          -1px -1px 2px rgba(13, 15, 19, 0.5),
          inset -7px 7px 14px rgba(13, 15, 19, 0.2),
          inset 7px -7px 14px rgba(13, 15, 19, 0.2),
          inset -7px -7px 14px rgba(53, 59, 77, 0.9),
          inset 7px 7px 18px rgba(13, 15, 19, 0.9);
      }
      &:active {
        box-shadow: -1px -1px 2px rgba(53, 59, 77, 0.3),
          1px 1px 2px rgba(13, 15, 19, 0.5),
          inset 6px -6px 12px rgba(13, 15, 19, 0.2),
          inset -6px 6px 12px rgba(13, 15, 19, 0.2),
          inset 6px 6px 12px rgba(53, 59, 77, 0.9),
          inset -6px -6px 15px rgba(13, 15, 19, 0.9);
      }
    }
  }
  .modal-body {
    height: calc(100% - 72px);
    overflow: auto;
  }
`;
