import styled from "styled-components";
import { theme } from "../../theme";

export const Wrapper = styled.div`
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
  .invite-h1-head {
    font-size: ${theme.sizes.h2};
    font-weight: 600;
    color: ${theme.colors.textColor4};
    text-align: center;
    margin-bottom: 1rem;
  }

  @media (min-width: 769px) {
    .invite-h1-head {
      font-size: ${theme.sizes.h1};
    }
  }
`;
