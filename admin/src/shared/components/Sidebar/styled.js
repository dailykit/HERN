import styled, { css } from 'styled-components'
import { Link } from 'react-router-dom'
import { IconButton } from '@dailykit/ui'

const Styles = {
   Sidebar: styled.aside(
      () => css`
         color: #202020;
         display: flex;
         flex-direction: column;
         background: rgba(255, 255, 255, 0.13);
         backdrop-filter: blur(44.37px);
         border: 1px solid #f2f3f3;
         border-radius: 10px;
         width: 224px;
         position: fixed;
         top: 46px;
         left: 7px;
         bottom: 7px;
         z-index: 10;
         overflow-y: auto;
         > :first-child {
            margin-top: 8px;
         }
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
      `
   ),
   AppTitle: styled(Link)`
      font-family: Roboto;
      font-style: normal;
      font-weight: 500;
      font-size: 12px;
      line-height: 16px;
      letter-spacing: 0.44px;
      text-transform: uppercase;
      color: #202020;
      padding-left: 4px;
      text-decoration: none;
   `,
   Heading: styled.h3`
      font-size: 16px;
      font-weight: 700;
      text-transform: uppercase;
      color: #367bf5;
   `,
   Pages: styled.ul`
      > :first-child {
         margin: 0px 0px 8px 34px;
      }
   `,
   PageItem: styled.li`
      display: flex;
      align-items: center;
      margin: 8px 0px 0px 34px;
      color: #202020;
      font-weight: 500;
      font-size: 12px;
      line-height: 14px;
      cursor: pointer;
      > span {
         display: block;
         margin-left: 6px;
      }
   `,
   Apps: styled.ul``,

   AppItem: styled.span`
      margin: 2px 8px;
      padding: 16px;
      background-color: #f6f6f6;
      :hover {
         background-color: #e8e8e8;
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
   AppIcon: styled.img`
      height: 14px;
      width: 14px;
      display: inline-block;
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
   Arrow: styled(IconButton)`
      border-radius: 50%;
      margin-left: auto;
      outline: none;
      background: ${props =>
         props.active
            ? `linear-gradient(135deg, #ffffff 0%, #ebebeb 100%)`
            : `#F5F5F5`};
      box-shadow: ${props =>
         props.active
            ? `1px 1px 2px rgba(255, 255, 255, 0.3), -1px -1px 2px rgba(203, 203, 203, 0.5), inset -1px 1px 2px rgba(203, 203, 203, 0.2), inset 1px -1px 2px rgba(203, 203, 203, 0.2), inset -1px -1px 2px rgba(255, 255, 255, 0.9), inset 1px 1px 3px rgba(203, 203, 203, 0.9);`
            : `-4px 4px 8px rgba(216, 216, 216, 0.2), 4px -4px 8px rgba(216, 216, 216, 0.2), -4px -4px 8px rgba(255, 255, 255, 0.9), 4px 4px 10px rgba(216, 216, 216, 0.9), inset 1px 1px 2px rgba(255, 255, 255, 0.3), inset -1px -1px 2px rgba(216, 216, 216, 0.5);`};
      > svg {
         stroke: #75787a;
      }
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
