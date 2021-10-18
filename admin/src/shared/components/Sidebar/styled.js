import styled, { css } from 'styled-components'
import { Link } from 'react-router-dom'
import { IconButton } from '@dailykit/ui'

const Styles = {
   Sidebar: styled.aside(
      () => css`
         color: #202020;
         display: flex;
         flex-direction: column;
         background: #ffffff;
         backdrop-filter: blur(44.37px);
         border: 1px solid #f2f3f3;
         border-radius: 10px;
         width: 52px;
         position: fixed;
         top: 55px;
         left: 0px;
         bottom: 7px;
         z-index: 10;
         overflow-y: auto;
         overflow-x: hidden;
         ::-webkit-scrollbar {
            width: 6px;
         }
         ::-webkit-scrollbar-thumb {
            background-color: rgba(196, 196, 196, 0.9);
            border-radius: 4px;
         }
         @media only screen and (max-width: 767px) {
            width: 100vw;
         }
         :hover {
            position: absolute;
            width: 222px;
            z-index: 3;
         }
      `
   ),
   AppTitle: styled.span`
      font-family: Roboto;
      font-style: normal;
      font-weight: 500;
      font-size: 14px;
      line-height: 16px;
      letter-spacing: 0.44px;
      text-transform: uppercase;
      padding-left: 16px;
      text-decoration: none;
      cursor: pointer;
   `,
   PageOneTitle: styled.div`
      font-size: 12px;
      line-height: 14px;
      font-weight: ${props => (props.active ? `700` : `500`)};
      padding-left: ${props => (props.active ? `30px` : `32px`)};
      color: ${props => (props.active ? `#367BF5` : `#555b6e`)};
   `,
   PageTwoTitle: styled.div`
      font-size: 11px;
      line-height: 13px;
      font-weight: ${props => (props.active ? `600` : `500`)};
      padding-left: ${props => (props.active ? `30px` : `30px`)};
      color: ${props => (props.active ? `#367BF5` : `#919699`)};
      > a {
         color: ${props => (props.active ? `#367BF5` : `#919699`)};
      }
   `,
   Heading: styled.h3`
      font-size: 16px;
      font-weight: 700;
      text-transform: uppercase;
   `,
   Pages: styled.ul``,

   PageItem: styled.li`
      display: flex;
      align-items: center;
      margin: 3px 0px 3px 14px;
      color: #555b6e;
      letter-spacing: 0.44px;
      font-weight: 500;
      font-size: 14px;
      line-height: 16px;
      cursor: pointer;
      > span {
         display: block;
         margin-left: 6px;
      }
      :hover {
         border-radius: 4px;
      }
   `,
   Apps: styled.ul``,

   AppItem: styled.span`
      margin: 2.5px 1px;
      background-color: #ffffff;
      :hover {
         background-color: #f9f9f9;
         border-radius: 4px;
      }
   `,
   CreateNewItems: styled.div`
      display: flex;
      flex-direction: column;
      padding-bottom: 18px;
   `,
   Menu: styled.button`
      margin-top: 4px;
      width: 48px;
      height: 48px;
      border: none;
      cursor: pointer;
      background-color: #fff;
      :hover,
      :focus {
         background: #fff;
      }
      border-radius: 0px 24px 24px 0px;
      box-shadow: 5px -5px 10px rgba(219, 219, 219, 0.2),
         -5px 5px 10px rgba(219, 219, 219, 0.2),
         5px 5px 10px rgba(255, 255, 255, 0.9),
         -5px -5px 13px rgba(219, 219, 219, 0.9),
         inset -1px -1px 2px rgba(255, 255, 255, 0.3),
         inset 1px 1px 2px rgba(219, 219, 219, 0.5);
   `,
   AppIcon: styled.svg`
      height: 16px;
      width: 16px;
      overflow: visible !important;
      fill: black !important;
   `,
   Logout: styled.button`
      padding: 8px 0px;
      color: #202020;
      font-weight: 500;
      font-size: 16px;
      margin: 16px;
      background-color: #fff;
      border-radius: 4px;
      border: 1px solid #e5e5e5;
   `,
   Choices: styled.div`
      width: 100%;
      padding-left: ${props => (props.active ? `15px` : `18px`)} !important;
      padding: 12px;
      display: flex;
      align-items: flex-start;
      color: ${props => (props.active ? `#367BF5` : `#202020`)};
      background: ${props => (props.active ? `#f9f9f9` : `#ffffff`)};
      border-left: ${props => (props.active ? `3px solid #367BF5` : `none`)};
      :hover {
         background: #f9f9f9;
         border-radius: 4px;
      }
   `,
   PageBox: styled.div`
      border: ${props => (props.active ? `2px solid #f9f9f9` : `none`)};
      box-sizing: border-box;
      border-radius: 4px;
      font-family: Roboto;
      font-style: normal;
      font-weight: 500;
      font-size: 14px;
      line-height: 16px;
      letter-spacing: 0.44px;
      text-transform: uppercase;
      text-decoration: none;
      cursor: pointer;
   `,
   Close: styled.div`
      margin-left: auto;
      display: none;
      @media only screen and (max-width: 767px) {
         display: block;
      }
   `,
}

export default Styles
