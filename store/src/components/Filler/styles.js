import styled from "styled-components";
import { theme } from "../../theme";

export const Filler = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
  .message {
    font-size: ${({ messageSize }) =>
      messageSize ? messageSize : theme.sizes.h2};
    color: ${theme.colors.textColor4};
  }
  .linkToExperiences {
    font-size: ${theme.sizes.h8};
    font-weight: 600;
    color: ${theme.colors.textColor};
    text-align: center;
    text-decoration: none;

    position: relative;
    padding: 8px 0;

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
      &:after {
        width: 100%;
      }
    }
  }
  .linkToExperiences,
  .linkToExperiences:before,
  .linkToExperiences:after {
    transition: all 560ms;
  }
`;
