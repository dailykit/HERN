import styled from "styled-components";
import { theme } from "../../../../theme";

export const Wrapper = styled.div`
  filter: ${({ disabled }) => disabled && "blur(4px)"};
  .invitation-div {
    background: ${theme.colors.mainBackground};
  }
  .invite-h1-head {
    font-size: ${theme.sizes.h2};
    font-weight: 600;
    color: ${theme.colors.textColor4};
    text-align: center;
    margin-bottom: 1rem;
  }
  .invite-sub-head {
    font-size: ${theme.sizes.h6};
    font-weight: 700;
    color: ${theme.colors.textColor4};
    text-align: left;
    margin-bottom: 1rem;
  }
  .invite-msg-div {
    background: ${theme.colors.textColor9};
    color: ${theme.colors.textColor4};
    font-size: ${theme.sizes.h6};
    font-weight: 400;
    text-align: left;
    .invite-msg {
      margin-bottom: 12px;
    }
    a {
      color: ${theme.colors.textColor};
      text-decoration: none;
    }
  }
  .invite-through-mail-div {
    padding: 1rem;
    color: ${theme.colors.textColor4};
    margin-bottom: 5rem;
    p {
      font-size: ${theme.sizes.h6};
      font-weight: 400;
    }
    .customInput {
      color: ${theme.colors.textColor4};
      margin: 1rem 0;
    }
    .invitation-address {
      padding: 10px;
      color: ${theme.colors.textColor4};
      background: #eb98ad;
      border-radius: 2px;
      margin: 4px;
    }
    .remove-btn {
      margin-left: 4px;
    }
  }
  .customBtn {
    color: ${theme.colors.textColor4};
    font-size: ${theme.sizes.h8};
    font-weight: 800;
    text-align: center;
    span {
      margin-right: 8px;
    }
  }
  .blink_me {
    animation: blinker 1s linear 1;
    @keyframes blinker {
      50% {
        opacity: 0;
      }
    }
  }

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
  .or {
    color: ${theme.colors.textColor4};
    font-size: ${theme.sizes.h8};
    font-weight: 700;
    text-align: center;
    margin-bottom: 1rem;
  }
`;
