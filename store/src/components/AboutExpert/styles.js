import styled from 'styled-components'
import { theme } from '../../theme'

export const Wrapper = styled.div`
   display: flex;
   flex-direction: column;
   align-items: center;
   border-radius: 40px;
   background-color: ${({ bg_mode }) =>
      bg_mode === 'dark'
         ? theme.colors.darkBackground.darkblue
         : theme.colors.lightBackground.grey};
   .imageWrapper {
      width: 100%;
      position: relative;
      .expertImg {
         width: 100%;
         border-radius: 40px 40px 0 0;
         object-fit: cover;
      }
   }
   .expertInfo {
      padding: 1rem;
      .expertName {
         color: ${theme.colors.textColor5};
         font-weight: 800;
         margin-bottom: 8px;
      }
      .expertCategory {
         color: ${theme.colors.textColor5};
         font-weight: 400;
         margin-bottom: 10px;
      }
      .expertExp {
         color: ${theme.colors.textColor5};
         font-weight: 400;
         margin-bottom: 43px;
      }
      .expertDesc {
         text-align: justify;
         color: ${theme.colors.textColor5};
         font-weight: 400;
         margin-bottom: 0;
         p {
            margin-bottom: 0;
         }
      }
      .readMore {
         border: none;
         text-align: center;
         text-transform: uppercase;
         font-weight: 800;
         color: ${theme.colors.textColor};
         background: none;
         cursor: pointer;
         margin-bottom: 56px;
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
      .readMore,
      .readMore:before,
      .readMore:after {
         transition: all 560ms;
      }
   }

   .custom_btn {
      width: 250px;
      height: 48px;
      font-family: 'Maven Pro';
      letter-spacing: 0.16em;
      color: ${theme.colors.textColor};
      margin: 0.5rem auto;
      display: block;
   }

   @media (min-width: 769px) {
      flex-direction: row;
      .imageWrapper {
         width: 50%;
         .expertImg {
            border-radius: 40px 0 0 40px;
         }
      }
      .expertInfo {
         width: 50%;
      }
   }
`
