import styled from "styled-components";
import { theme } from "../../theme";
export const Wrapper = styled.div`
  .heading {
    font-size: ${theme.sizes.h3};
    font-weight: 400;
    color: ${theme.colors.textColor4};
    text-align: center;
    margin: 2rem 4rem;
    line-height: 35px;
  }
  .customInput {
    margin-bottom: 1.5rem;
    color: ${theme.colors.textColor2};
  }
  .categoryTag {
    height: 48px;
    font-size: ${theme.sizes.h8};
    width: auto;
    padding: 1rem;
    margin: 8px;
  }

  .skip {
    display: flex;
    align-items: center;
    color: ${theme.colors.textColor2};
    font-size: ${theme.sizes.h6};
    margin-bottom: 6rem;
    justify-content: right;
    margin-right: 1rem;
    a {
      text-decoration: none;
      text-transform: uppercase;
      color: ${theme.colors.textColor};
      font-weight: 800;
    }
  }

  .getStartedBtnWrap {
    width: 100%;
    position: absolute;
    left: 0;
    bottom: 0;
    padding: 0 1rem;
    margin: 1rem 0;
    z-index: 3;
  }
  .getStartedBtn {
    height: 48px;
    font-size: ${theme.sizes.h8};
    &:disabled {
      background: #ccc;
      height: 48px;
      font-size: ${theme.sizes.h8};
      cursor: not-allowed;
      color: #aaa;
    }
  }

  .center-div-wrapper {
    width: 100%;
    margin: auto;
  }

  @media (min-width: 769px) {
    .skip {
      display: none;
    }
    .getStartedBtnWrap {
      position: relative;
      padding: 0;
    }
    .center-div-wrapper {
      width: 80%;
    }
  }
`;

export const CategoryTagWrap = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
`;
