import styled from "styled-components";
import { theme } from "../../theme";

export const Wrapper = styled.div`
  height: 100%;
  overflow-y: ${({ defaultActionButton }) =>
    defaultActionButton ? "auto" : "unset"};
  .customAddressBtn {
    height: 38px;
    text-transform: none;
    font-weight: 600;
    width: auto;
    padding: 0 1rem;
  }
  .address_form_div {
    display: flex;
    flex-direction: column;
    padding: 1rem;
    height: 100%;
    margin-bottom: 1rem;
    label {
      font-size: ${theme.sizes.h6};
      font-weight: 500;
      color: ${theme.colors.textColor4};
      margin-bottom: 8px;
    }
  }
  .customAddressInput {
    margin-bottom: 1rem;
    color: ${theme.colors.textColor4};
  }
  .address-head {
    font-size: ${theme.sizes.h6};
    font-weight: 500;
    color: ${theme.colors.textColor4};
    margin: 1rem;
    text-align: left;
  }
  .footer-submit-btn-div {
    background: ${theme.colors.mainBackground};
    position: sticky;
    bottom: 20px;
    left: 0;
    z-index: 5;
    padding: 1rem 0;
    width: 100%;
    .custom-submit-button {
      height: 38px;
      color: ${theme.colors.textColor4};
      &:disabled {
        cursor: not-allowed;
        background: ${theme.colors.disableBackground};
      }
    }
  }
`;

export const AddressSearch = styled.section`
  margin-bottom: 16px;
  padding: 1rem;
  label {
    font-size: ${theme.sizes.h6};
    font-weight: 500;
    color: ${theme.colors.textColor4};
    margin-bottom: 8px;
  }
  .google-places-autocomplete {
    width: 100%;
    position: relative;
  }
  .google-places-autocomplete__input {
    border-bottom-width: 1px;
    height: 2rem;
    width: 100%;
    &:focus {
      outline: none;
      border-color: #718096;
    }
  }
  .google-places-autocomplete__input:active,
  .google-places-autocomplete__input:focus,
  .google-places-autocomplete__input:hover {
    outline: 0;
    border: none;
  }
  .google-places-autocomplete__suggestions-container {
    background: ${theme.colors.mainBackground};
    box-shadow: 1px 1px 2px rgba(50, 56, 72, 0.3),
      -1px -1px 2px rgba(17, 19, 24, 0.5),
      inset -5px 5px 10px rgba(17, 19, 24, 0.2),
      inset 5px -5px 10px rgba(17, 19, 24, 0.2),
      inset -5px -5px 10px rgba(50, 56, 72, 0.9),
      inset 5px 5px 13px rgba(17, 19, 24, 0.9);
    border-radius: 0 0 5px 5px;
    color: ${theme.colors.textColor4};
    position: absolute;
    width: 100%;
    z-index: 2;
  }
  .google-places-autocomplete__suggestion {
    font-size: 1rem;
    text-align: left;
    padding: 10px;
    cursor: pointer;
  }
  .google-places-autocomplete__suggestion:hover {
    background: rgba(0, 0, 0, 0.1);
  }
  .google-places-autocomplete__suggestion--active {
    background: ${theme.colors.mainBackground};
  }
`;
