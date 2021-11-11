import styled from 'styled-components'
import { theme } from '../../theme'

export const Wrapper = styled.div`
   display: flex;
   flex-direction: column;
   align-items: center;
   border-radius: 24px;
   background-color: ${({ bg_mode }) =>
      bg_mode === 'dark'
         ? theme.colors.darkBackground.darkblue
         : theme.colors.lightBackground.grey};
   .imageWrapper {
      width: 100%;
      position: relative;
      max-height: 320px;
      overflow: hidden;
      border-radius: 24px 24px 0 0;
      .expertImg {
         width: 100%;
         object-fit: cover;
      }
   }
   .expertInfo {
      padding: 2rem;
      max-height: 320px;
      overflow-y: auto;
      .expertName {
         color: ${theme.colors.textColor5};
         font-weight: 700;
         margin-bottom: 8px;
         font-family: 'Barlow Condensed';
         text-transform: uppercase;
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
      .expertDesc,
      .expertDesc p {
         text-align: left;
         color: ${theme.colors.textColor5};
         font-family: 'Maven Pro';
         margin-bottom: 0;
         overflow: hidden;
         text-overflow: ellipsis;
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
      width: 90%;
      height: 48px;
      font-family: 'Maven Pro';
      letter-spacing: 0.16em;
      color: ${theme.colors.textColor};
      margin: 1rem auto;
      display: block;
      :hover {
         background: ${theme.colors.textColor};
         color: ${theme.colors.textColor4};
      }
   }

   @media (min-width: 769px) {
      flex-direction: row;
      .imageWrapper {
         width: 40%;
         border-radius: 24px 0 0 24px;
      }
      .expertInfo {
         width: 60%;
      }
   }
`
