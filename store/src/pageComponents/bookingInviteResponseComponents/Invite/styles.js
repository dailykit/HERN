import styled from "styled-components";
import { theme } from "../../../theme";

export const Wrapper = styled.div`
  padding: 1rem;
  .host-img {
    width: 85px;
    height: 85px;
    object-fit: cover;
    display: block;
    margin: 1rem auto;
    border-radius: 50%;
  }
  .host-name-head {
    font-size: ${theme.sizes.h2};
    font-weight: 600;
    color: ${theme.colors.textColor4};
    text-align: center;
  }
  .normal-heading {
    font-size: ${theme.sizes.h3};
    font-weight: 600;
    color: ${theme.colors.textColor4};
    margin-bottom: 20px;
    text-align: center;
  }
  .below-para {
    font-size: ${theme.sizes.h4};
    font-weight: 400;
    color: ${theme.colors.textColor4};
    text-align: center;
  }
`;
