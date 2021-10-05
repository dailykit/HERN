import styled from 'styled-components'
import { theme } from '../../theme'
export const Wrapper = styled.div`
   .heading {
      font-weight: 400;
      color: ${theme.colors.textColor};
      text-align: center;
      margin: 2rem 4rem;
      font-family: League-Gothic;
   }
   .customInput {
      height: 74px;
      margin-bottom: 1.5rem;
      color: ${theme.colors.textColor5};
      background: ${theme.colors.lightBackground.grey};
      font-family: Proxima Nova;
      font-weight: 700px;
      letter-spacing: 0.3em;
      ::placeholder {
         font-weight: 700px;
         letter-spacing: 0.3em;
         text-transform: uppercase;
      }
   }
   .center-div-wrapper {
      width: 100%;
      margin: auto;
   }
   .loginBtnWrap {
      width: 100%;
      position: absolute;
      left: 0;
      bottom: 0;
      padding: 0;
      margin: 0;
      z-index: 3;
   }
   .loginBtn {
      height: 48px;
      background: ${theme.colors.textColor};
      color: ${theme.colors.textColor4};
      border-radius: 0px;
      font-family: League-Gothic;
      letter-spacing: 0.04em;
      &:disabled {
         background: ${theme.colors.textColor};
         height: 48px;
         cursor: not-allowed;
      }
   }
   .disabled {
      cursor: not-allowed;
      background: rgba(209, 213, 219, 0.7);
   }
   .signup_title {
      color: ${theme.colors.textColor7};
      font-family: Proxima Nova;
      font-style: normal;
      font-weight: 700;
      letter-spacing: 0.3em;
      cursor: pointer;
      margin: 1.5rem 0;
      span {
         color: ${theme.colors.textColor};
         font-family: Proxima Nova;
         margin-left: 0.5rem;
         text-decoration: underline;
      }
   }
   .forgotPassword {
      color: ${theme.colors.textColor};
      width: max-content;
      font-family: Proxima Nova;
      font-style: normal;
      font-weight: 700;
      letter-spacing: 0.3em;
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
         content: '';
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
         margin: 1rem 0;
         .loginBtn {
            border-radius: 8px;
         }
      }
      .redirectToSignup {
         display: none;
      }
      .center-div-wrapper {
         width: 80%;
      }
   }
`

export const FormWrap = styled.form`
   width: 100%;
   padding: 16px;
   margin-bottom: 4rem;
   @media (min-width: 769px) {
      margin: 0;
   }
`
