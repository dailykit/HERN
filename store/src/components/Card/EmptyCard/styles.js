import styled from "styled-components";
import { theme } from "../../../theme";
export const Card = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 1rem;
  background: ${theme.colors.mainBackground};
  box-shadow: 0px 8px 12px 2px rgba(0, 0, 0, 0.32);
  border-radius: 16px;
`;

export const CardImage = styled.div`
  width: 100%;
  height: 118px;
  background: linear-gradient(
    89.74deg,
    rgba(68, 68, 68, 0.29) 0.21%,
    rgba(119, 119, 119, 0) 99.77%
  );
  border-radius: 8px;
`;

export const CardBody = styled.div`
  color: ${theme.colors.textColor7};
  width: 100%;
  .exp-name {
    margin: 4px 0 4px 0;
    font-size: ${theme.sizes.h8};
    font-weight: 500;
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
    font-size: ${theme.sizes.h7};
    color: ${theme.colors.tertiaryColor};
    text-transform: uppercase;
    cursor: pointer;
  }
  .duration {
    display: flex;
    align-items: center;
    span {
      width: 25px;
      height: 16px;
      border-radius: 25px;
      background: linear-gradient(
        89.74deg,
        rgba(68, 68, 68, 0.29) 0.21%,
        rgba(119, 119, 119, 0) 99.77%
      );
      margin-left: 8px;
      font-size: ${theme.sizes.h7};
    }
  }
  .expertImgDiv {
    width: 24px;
    height: 24px;
    border-radius: 50px;
    background: linear-gradient(
      89.74deg,
      rgba(68, 68, 68, 0.29) 0.21%,
      rgba(119, 119, 119, 0) 99.77%
    );
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
