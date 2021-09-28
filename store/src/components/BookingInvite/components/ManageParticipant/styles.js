import styled from "styled-components";
import { theme } from "../../../../theme";

export const Wrapper = styled.div`
  color: ${theme.colors.textColor4};
  .participant-email {
    font-weight: 800;
    font-size: ${theme.sizes.h8};
    color: ${theme.colors.textColor4};
    span {
      font-size: ${theme.sizes.h2};
      line-height: 48px;
      letter-spacing: -0.02em;
      color: ${theme.colors.textColor4};
      opacity: 0.5;
    }
  }
  .billing-action {
    display: flex;
    align-items: center;
    position: relative;
    text-decoration: none;
    color: ${theme.colors.textColor};
    padding: 4px 0;

    &:after {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      margin: auto;
      width: 0%;
      content: "";
      color: ${theme.colors.textColor};
      background: ${theme.colors.textColor};
      height: 2px;
    }
    &:hover {
      color: ${theme.colors.textColor};
      cursor: pointer;
      &:after {
        width: 100%;
      }
    }
  }
  .billing-action,
  .billing-action:before,
  .billing-action:after {
    transition: all 560ms;
  }
  .svg-edit-icon {
    margin-left: 16px;
    &:hover {
      cursor: pointer;
      svg {
        stroke: #000;
        path {
          fill: #000;
        }
      }
    }
  }
  .svg-delete-icon {
    margin-left: 16px;
    &:hover {
      cursor: pointer;
      svg {
        stroke: #000;
      }
    }
  }

  .hidden {
    display: none;
  }

  .show {
    transition: height 0.3s;
    display: block;
  }

  .billing-details {
    table {
      width: 100%;
      td {
        text-align: left;
        padding: 8px;
        text-align: left;
      }
    }
  }
`;
