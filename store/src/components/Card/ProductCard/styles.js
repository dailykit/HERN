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
  max-height: 350px;
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease-in-out;
  &:hover {
    box-shadow: rgba(0, 0, 0, 0.32) 0px 19px 43px;
    transform: translate3d(0px, -1.5px, 0px);
  }
`;

export const CardImage = styled.div`
  width: 100%;
  height: 50%;
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
  .booked-exp {
    text-align: center;
    font-weight: 800;
    font-size: ${theme.sizes.h8};
    color: ${theme.colors.textColor};
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

  .product-discount-tag {
    border: 0px solid black;
    background: rgb(17, 27, 43);
    box-sizing: border-box;
    font-size: 0.8rem;
    font-style: italic;
    padding: 2px;
    color: #fff;
    position: absolute;
    right: 4px;
    top: -4px;
  }
  .product_add_wrap {
    display: flex;
    align-items: center;
    .icon_wrap {
      width: 20px;
      height: 20px;
      background: #fff;
      border-radius: 50%;
      margin-left: 8px;
    }
    .icon_wrap_1 {
      width: 20px;
      height: 20px;
      background: ${theme.colors.textColor};
      border-radius: 50%;
      margin-left: 8px;
    }
  }

  .product_extra_info_text {
    margin: 2px 0;
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

export const TagGroup = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
  margin: 0.5rem 0;
`;

export const Tag = styled.div`
  font-size: ${theme.sizes.h8};
  color: ${theme.colors.textColor4};
  text-transform: capitalize;
  border: 1px solid ${theme.colors.textColor};
  padding: 4px;
  border-radius: 4px;
`;
