import styled from "styled-components";
import { theme } from "../../theme";
export const Wrapper = styled.div`
  width: 100%;
  margin-bottom: 1rem;
  padding: ${({ type }) => (type === "tunnel" ? "1rem" : "0")};
  height: 100%;
  overflow-y: auto;
  .ghost {
    color: ${theme.colors.textColor4};
    width: 100%;
    display: flex;
    align-items: flex-end;
    padding: 6px;
    cursor: pointer;
    &:hover {
      color: ${theme.colors.textColor};
      svg {
        stroke: ${theme.colors.textColor};
      }
    }
    span {
      margin-left: 8px;
    }
  }
  .sticky-header {
    background: ${theme.colors.mainBackground};
    position: sticky;
    top: -1px;
    padding: 8px;
    z-index: 3;
  }
  .greet-msg {
    font-size: 32px;
    font-weight: 500;
    color: ${theme.colors.textColor4};
    margin-bottom: 2rem;
    text-align: center;
  }
  .custom-btn {
    width: auto;
    padding: 0 1rem;
    margin-bottom: 20px;
    background: ${theme.colors.secondaryColor};
  }
  .grid-view {
    display: grid;
    grid-template-columns: repeat(1, minmax(240px, 1fr));
    grid-gap: 1rem;
    display: 100%;
  }
  .customButton {
    padding: 0 1rem;
    margin-bottom: 20px;
    background: ${theme.colors.secondaryColor};
  }
  .empty_address_msg {
    text-align: center;
    color: ${theme.colors.textColor4};
    font-size: ${theme.sizes.h3};
  }
  .address-card {
    width: 100%;
    position: relative;
    background: ${theme.colors.mainBackground};
    min-height: 100px;
    margin-bottom: 1rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-radius: 4px;
    box-shadow: -1px 1px 2px rgb(27 30 39 / 20%),
      1px -1px 2px rgb(27 30 39 / 20%), -1px -1px 2px rgb(39 44 57 / 90%),
      1px 1px 3px rgb(27 30 39 / 90%), inset 1px 1px 2px rgb(39 44 57 / 30%),
      inset -1px -1px 2px rgb(27 30 39 / 50%);
    padding: 1rem;
    .checkbox-wrap {
      display: flex;
      flex-direction: column;
      align-items: center;
      color: ${theme.colors.textColor4};
      margin-right: 8px;
      cursor: pointer;
      small {
        margin-top: 4px;
      }
    }
    .checkbox-label {
      margin-left: 1rem;
      font-size: ${theme.sizes.h6};
      font-weight: 500;
      color: ${theme.colors.textColor4};
    }

    .delete-btn {
      position: absolute;
      bottom: 8px;
      right: 8px;
      cursor: pointer;
      padding: 4px;
      pointer-events: ${({ isDeleting }) => (isDeleting ? "none" : "unset")};
      &:hover {
        background: ${theme.colors.textColor2};
        svg {
          stroke: ${theme.colors.tertiaryColor};
        }
      }
    }
  }
  .payment-div {
    padding: 32px 0;
    .payment-icon-wrapper {
      display: flex;
      align-items: center;
      .payment-icon {
        margin-right: 8px;
      }
    }
  }

  @media (max-width: 769px) {
    .customButton {
      margin-bottom: 64px;
    }
  }
`;
