import styled from "styled-components";
import { theme } from "../../../../theme";

export const Wrapper = styled.div`
  width: 100%;
  height: 100%;
  color: ${theme.colors.textColor4};
  padding: 1rem;
  .edit-tunnel-header {
    color: ${theme.colors.textColor};
    font-size: ${theme.sizes.h3};
    font-weight: 600;
    text-align: center;
    margin: 1rem 0 2rem 0;
  }
  .input-label {
    color: ${theme.colors.textColor4};
    font-size: ${theme.sizes.h8};
    font-weight: 600;
    margin: 8px 4px;
  }
  .address-form-input {
    color: ${theme.colors.textColor4};
    margin-bottom: 1rem;
  }
`;
