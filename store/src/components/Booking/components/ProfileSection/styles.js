import styled from "styled-components";
import { theme } from "../../../../theme";

export const Wrapper = styled.div`
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
`;
