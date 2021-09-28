import styled from "styled-components";
import { theme } from "../../../theme";
export const Card = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  background: ${theme.colors.mainBackground};
  box-shadow: ${({ boxShadow = "true" }) =>
    boxShadow === "true"
      ? "0px 8px 12px 2px rgba(0, 0, 0, 0.32)"
      : "none" || "0px 8px 12px 2px rgba(0, 0, 0, 0.32)"};
  border-radius: 16px;
  cursor: pointer;
  overflow: hidden;
  transition: all 0.3s ease-in-out;
  &:hover {
    box-shadow: rgba(0, 0, 0, 0.32) 0px 19px 43px;
    transform: translate3d(0px, -1.5px, 0px);
  }
`;

export const CardImage = styled.div`
  width: 100%;
  height: 120px;
  overflow: hidden;
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 650ms;
    &:hover {
      transform: scale(1.03);
    }
  }
  @media (min-width: 769px) {
    height: 180px;
  }
`;

export const CardBody = styled.div`
  color: ${theme.colors.textColor2};
  width: 100%;
  padding: 1rem;
  .exp-name {
    margin: 4px 0 4px 0;
    font-size: ${theme.sizes.h8};
    font-weight: 500;
    text-align: left;
  }
  .exp-info {
    font-weight: 800;
    font-size: ${theme.sizes.h7};
    span {
      font-weight: 400;
      font-size: ${theme.sizes.h7};
    }
  }
  .book-exp {
    text-align: center;
    font-weight: 800;
    font-size: ${theme.sizes.h8};
    color: ${theme.colors.tertiaryColor};
    text-transform: uppercase;
    cursor: pointer;
  }
  .duration {
    display: flex;
    align-items: center;
    span {
      margin-left: 8px;
      font-size: ${theme.sizes.h7};
    }
  }
  .expertImgDiv {
    width: 14px;
    height: 14px;
  }
  .expert-img {
    width: 100%;
    height: 100%;
    border-radius: 50px;
  }
  @media (min-width: 769px) {
    .exp-name {
      margin: 1rem 0 0.5rem 0;
      font-size: ${theme.sizes.h4};
    }
    .exp-info {
      font-size: ${theme.sizes.h8};
      font-weight: 600;
    }
    .duration {
      span {
        font-size: ${theme.sizes.h8};
      }
    }
    .book-exp {
      font-size: ${theme.sizes.h8};
    }
    .expertImgDiv {
      width: 24px;
      height: 24px;
    }
  }
`;
