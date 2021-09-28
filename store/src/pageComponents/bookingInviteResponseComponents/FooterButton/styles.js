import styled from "styled-components";
import { theme } from "../../../theme";
export const Wrapper = styled.div`
  .modal-content-div {
    color: ${theme.colors.textColor4};
    .pinImg {
      width: 50px;
      height: 50px;
      display: block;
      margin: 1rem auto;
    }
    .response-sub-head {
      font-size: ${theme.sizes.h8};
      font-weight: 600;
      color: ${theme.colors.textColor4};
      margin-bottom: 2rem;
      text-align: center;
    }
    .custom-response-input {
      color: ${theme.colors.textColor4};
    }
    .custom-done-btn-wrapper {
      background: ${theme.colors.mainBackground};
      position: absolute;
      bottom: 2rem;
      left: 0;
      z-index: 5;
      padding: 1rem;
      width: 100%;
    }
    .custom-done-btn {
      height: 48px;
    }
  }
  .slots-wrapper {
    padding: 1rem;
    margin-bottom: 1rem;
  }

  .footer-sticky-btn-div {
    background: ${theme.colors.mainBackground};
    box-shadow: 0px -6px 9px 3px rgba(0, 0, 0, 0.2);
    position: sticky;
    bottom: 0;
    z-index: 5;
    padding: 1rem;
    width: 100%;
    .poll-expiry-msg {
      font-size: ${theme.sizes.h7};
      font-weight: 400;
      font-style: italic;
      color: ${theme.colors.textColor4};
      text-align: center;
      margin-bottom: 8px;
    }
    .custom-submit-btn {
      height: 48px;
    }
  }
  @media (min-width: 769px) {
    .footer-sticky-btn-div {
      bottom: 2rem;
    }
  }
`;
