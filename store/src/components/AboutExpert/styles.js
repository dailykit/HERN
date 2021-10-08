import styled from 'styled-components'
import { theme } from '../../theme'

export const Wrapper = styled.div`
   display: flex;
   flex-direction: column;
   align-items: center;
   border-radius: 40px;
   padding: 1rem 2rem;
   background-color: ${({ bg_mode }) =>
      bg_mode === 'dark'
         ? theme.colors.darkBackground.darkblue
         : theme.colors.lightBackground.grey};
   .imageWrapper {
      padding: 0 1rem;
      height: 100%;
      position: relative;
      .expertImg {
         width: 150px;
         height: 100%;
         border-radius: 20px;
         object-fit: cover;
      }
   }
   .expertInfo {
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
      margin-bottom: 2rem;
   }

   @media (min-width: 769px) {
      flex-direction: row;
      .imageWrapper {
         .expertImg {
            width: 260px;
            height: 100%;
         }
      }
      .custom_btn {
         margin: 0;
      }
   }
`
