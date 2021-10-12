import styled from 'styled-components'
import { theme } from '../../theme'

export const Wrapper = styled.div`
   height: 100%;
   overflow-y: ${({ defaultActionButton }) =>
      defaultActionButton ? 'auto' : 'unset'};
   .customAddressBtn {
      height: 38px;
      text-transform: none;
      font-weight: 600;
      width: auto;
      padding: 0 1rem;
   }
   .proxinova_text {
      font-family: Proxima Nova;
      font-style: normal;
      font-weight: 600;
      letter-spacing: 0.16em;
      color: ${theme.colors.textColor5};
      margin-bottom: 0 !important;
   }
   .address_form_div {
      display: flex;
      flex-direction: column;
      height: 100%;
      margin-bottom: 1rem;
      label {
         font-family: Proxima Nova;
         font-style: normal;
         font-weight: 600;
         letter-spacing: 0.16em;
         color: ${theme.colors.textColor7};
         font-size: ${theme.sizes.h9};
      }
   }
   .customAddressInput {
      height: 48px;
      margin: 1rem 0;
      color: ${theme.colors.textColor5};
      background: ${theme.colors.lightBackground.grey};
      font-family: Proxima Nova;
      font-weight: 600px;
      letter-spacing: 0.16em;
      ::placeholder {
         font-weight: 600px;
         letter-spacing: 0.16em;
         text-transform: uppercase;
      }
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
`

export const AddressSearch = styled.section`
   margin-bottom: 16px;
   padding: 1rem 0;
   label {
      font-family: Proxima Nova;
      font-style: normal;
      font-weight: 600;
      letter-spacing: 0.16em;
      color: ${theme.colors.textColor7};
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
      border-radius: 0 0 5px 5px;
      color: ${theme.colors.textColor7};
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
`
