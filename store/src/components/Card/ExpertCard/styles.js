import styled from "styled-components";
import { theme } from "../../../theme";

export const Card = styled.div`
  width: ${({ customWidth = "170px" }) => customWidth};
  height: ${({ customHeight = "200px" }) => customHeight};
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 1rem;
  background: ${theme.colors.mainBackground};
  box-shadow: ${({ boxShadow = "true" }) =>
    boxShadow === "true"
      ? "0px 8px 12px 2px rgba(0, 0, 0, 0.32)"
      : "none" || "0px 8px 12px 2px rgba(0, 0, 0, 0.32)"};
  border-radius: 16px;
  overflow: hidden;
  transition: all 0.3s ease-in-out;
  &:hover {
    box-shadow: rgba(0, 0, 0, 0.32) 0px 19px 43px;
    transform: translate3d(0px, -1.5px, 0px);
  }
  @media (min-width: 769px) {
    width: 250px;
    height: 240px;
  }
`;

export const CardImage = styled.div`
  position: relative;
  width: 50%;
  height: 50%;
  border-radius: 50%;
  overflow: hidden;
  margin: 0 auto;
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 50%;
    transition: transform 650ms;
    &:hover {
      transform: scale(1.03);
    }
  }
`;

export const CardBody = styled.div`
  color: ${theme.colors.textColor2};
  width: 100%;
  .exp-name {
    text-align: center;
    font-weight: 500;
    font-size: ${theme.sizes.h9};
    margin: 2px 0;
  }
  .category {
    text-align: center;
    font-weight: 400;
    font-size: ${theme.sizes.h7};
  }
  .experience {
    text-align: center;
    font-weight: 400;
    font-size: ${theme.sizes.h7};
    font-style: italic;
    margin: 8px 0;
  }
  .viewProfileBtn {
    border: none;
    text-align: center;
    text-transform: uppercase;
    font-weight: 800;
    font-size: ${theme.sizes.h6};
    color: ${theme.colors.textColor};
    background: none;
    cursor: pointer;
  }
  @media (min-width: 769px) {
    .exp-name {
      font-size: ${theme.sizes.h2};
    }
    .category {
      font-size: ${theme.sizes.h8};
    }
  }
`;
