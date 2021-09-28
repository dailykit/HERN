import styled from "styled-components";

import { theme } from "../../../../theme";

export const Wrapper = styled.div`
  color: ${theme.colors.textColor4};
  height: 100%;
  position: relative;
  padding: 1rem;
  .product_img_wrapper {
    width: 100%;
    height: 150px;
    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }
  .product_name {
    font-size: ${theme.sizes.h2};
    color: ${theme.colors.textColor4};
    margin: 1rem 0;
  }
  .product_type {
    font-size: ${theme.sizes.h8};
    color: ${theme.colors.textColor4};
    margin: 0.5rem 0;
    text-transform: uppercase;
    border: 1px solid ${theme.colors.textColor};
    padding: 8px 1rem;
    border-radius: 4px;
    width: max-content;
  }
  .product_extra_info_text {
    font-size: ${theme.sizes.h8};
    color: ${theme.colors.textColor4};
    margin: 0.5rem 0;
  }
  .product_discount_badge {
    background: rgb(17, 27, 43);
    box-sizing: border-box;
    font-size: 0.8rem;
    font-style: italic;
    padding: 2px;
    color: #fff;
    position: absolute;
    right: 20px;
    top: 4px;
  }
  .productOptions_heading {
    font-size: ${theme.sizes.h9};
    color: ${theme.colors.textColor4};
    margin: 1rem 0;
  }
  .productOption_wrapper {
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: ${theme.sizes.h8};
    color: ${theme.colors.textColor4};
    border: 1px solid ${theme.colors.textColor};
    padding: 8px 1rem;
    margin: 10px 0;
    &:hover {
      cursor: pointer;
    }
  }
  .selectedProductOption_wrapper {
    border: none;
    background: ${theme.colors.secondaryColor};
  }
`;
export const Footer = styled.footer`
  width: 100%;
  height: 50px;
  position: fixed;
  bottom: 24px;
  padding: 0 1rem;
  > button > p {
    font-size: ${theme.sizes.h8};
  }
`;
