import styled from "styled-components";
import { theme } from "../../theme";
export const Wrapper = styled.div`
  height: calc(100% - 5rem);
  .heading {
    font-size: ${theme.sizes.h2};
    font-weight: 800;
    color: ${theme.colors.textColor4};
    text-align: center;
    margin: 2rem;
  }
  .customInput {
    margin-bottom: 1.5rem;
    color: ${theme.colors.textColor2};
  }
  .loginBtnWrap {
    width: 100%;
    position: absolute;
    left: 0;
    bottom: -5px;
    padding: 0 1rem;
    margin-bottom: 1rem;
    z-index: 3;
  }
  .loginBtn {
    height: 48px;
    font-size: ${theme.sizes.h8};
    width: ${({ isOpen }) => isOpen && "100%"};
  }
  .disabled {
    cursor: not-allowed;
    background: rgba(209, 213, 219, 0.7);
  }
  .forgotPassword {
    color: ${theme.colors.textColor};
    width: max-content;
    margin-bottom: 4rem;
    margin-right: 1rem;
    cursor: pointer;
    position: relative;
    text-decoration: none;
    padding: 4px 0;
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
  .forgotPassword,
  .forgotPassword:before,
  .forgotPassword:after {
    transition: all 560ms;
  }

  .redirectToSignup {
    display: block;
    color: ${theme.colors.textColor2};
    font-size: ${theme.sizes.h6};
    margin-bottom: 6rem;
    text-align: right;
    margin-right: 1rem;
    a {
      text-decoration: none;
      text-transform: uppercase;
      color: ${theme.colors.tertiaryColor};
      font-weight: 800;
    }
  }
  .flex {
    display: flex;
    justify-content: center;
    align-items: center;
    position: relative;

    .back-to-login {
      position: absolute;
      left: 20px;
      &:hover {
        cursor: pointer;
      }
    }
  }

  @media (min-width: 769px) {
    .loginBtnWrap {
      position: relative;
      padding: 0;
      z-index: 0;
    }
    .redirectToSignup {
      display: none;
    }
  }
`;

export const FormWrap = styled.form`
  width: 100%;
  padding: 16px;
  @media (min-width: 769px) {
    height: calc(100% - 5rem);
    position: relative;
  }
`;
