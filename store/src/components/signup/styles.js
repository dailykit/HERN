import styled from 'styled-components'
import { theme } from '../../theme'

export const Wrapper = styled.div`
   .heading {
      font-weight: 400;
      color: ${theme.colors.textColor};
      text-align: center;
      margin: 2rem 4rem;
      font-family: 'Barlow Condensed';
   }
   .password-wrap {
      height: 74px;
      margin-bottom: 1.5rem;
      position: relative;
      .eye-icon {
         background: ${theme.colors.lightBackground.grey};
         position: absolute;
         right: 1rem;
         top: 50%;
         background: ${theme.colors.lightBackground.grey};
         transform: translateY(-50%);
         border-radius: 50%;
         width: 30px;
         height: 30px;
         display: flex;
         align-items: center;
         justify-content: center;
         :hover {
            background: ${theme.colors.textColor7};
            cursor: pointer;
         }
      }
   }
   .customInput {
      height: 48px;
      margin-bottom: 1.5rem;
      color: ${theme.colors.textColor5};
      background: ${theme.colors.lightBackground.grey};
      font-family: 'Maven Pro';
      font-weight: 700px;
      letter-spacing: 0.3em;
      ::placeholder {
         font-weight: 700px;
         letter-spacing: 0.3em;
         text-transform: uppercase;
      }
      &:-webkit-autofill,
      -webkit-autofill:hover,
      -webkit-autofill:focus,
      -webkit-autofill:active {
         -webkit-box-shadow: 0 0 0 40px ${theme.colors.lightBackground.grey}
            inset !important;
      }
   }
   .center-div-wrapper {
      width: 100%;
      margin: auto;
   }

   .signupBtnWrap {
      width: 100%;
      position: absolute;
      left: 0;
      bottom: 0;
      padding: 0;
      margin: 0;
      z-index: 3;
   }
   .signupBtn {
      height: 48px;
      background: ${theme.colors.textColor};
      color: ${theme.colors.textColor4};
      border-radius: 0px;
      font-family: 'Barlow Condensed';
      letter-spacing: 0.04em;
      &:disabled {
         background: ${theme.colors.textColor};
         height: 48px;
         cursor: not-allowed;
      }
   }

   .redirectToLogin {
      display: block;
      color: ${theme.colors.textColor2};
      font-size: ${theme.sizes.h6};
      margin-bottom: 6rem;
      text-align: right;
      margin-right: 1rem;
      a {
         text-decoration: none;
         text-transform: uppercase;
         color: ${theme.colors.textColor};
         font-weight: 800;
      }
   }

   .login_title {
      color: ${theme.colors.textColor7};
      font-family: 'Maven Pro';
      font-style: normal;
      font-weight: 700;
      letter-spacing: 0.3em;
      cursor: pointer;
      text-align: center;
      margin: 1.5rem 0;
      span {
         color: ${theme.colors.textColor};
         font-family: 'Maven Pro';
         margin-left: 0.5rem;
         text-decoration: underline;
      }
   }

   @media (min-width: 769px) {
      .customInput {
         height: 74px;
      }
      .signupBtnWrap {
         position: relative;
         padding: 0;
         margin: 1rem 0;
         .signupBtn {
            border-radius: 8px;
         }
      }
      .redirectToLogin {
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
