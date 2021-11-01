import styled from 'styled-components'
import { Drawer } from 'antd'
import { theme } from '../../theme'

export const NavBar = styled.header`
   transform: ${({ floating = false, scroll }) =>
      floating
         ? scroll.direction === 'down'
            ? 'translateY(-100%)'
            : 'translateY(0)'
         : 'unset'};
   display: ${({ floating, scroll }) =>
      floating ? (scroll.y < 64 ? 'none' : 'flex') : 'flex'};
   height: 64px;
   position: ${({ floating = false }) => (floating ? 'fixed' : 'unset')};
   top: 0;
   left: 0;
   width: 100%;
   z-index: 100;
   align-items: center;
   padding: 1rem 6rem;
   justify-content: space-between;
   transition: 0.2s ease-in;
   background: ${theme.colors.darkBackground.darkblue};
   .logo-img {
      width: 100px;
      height: 48px;
      object-fit: contain;
   }

   .ant-menu-horizontal {
      width: 100%;
      margin-left: 1rem;
      background: none;
      border: none;
      color: ${theme.colors.textColor4};
      display: flex;
      justify-content: flex-end;
   }

   .ant-menu-horizontal > .ant-menu-item {
      :hover {
         color: ${theme.colors.textColor};
         ::after {
            border-bottom: 2px solid ${theme.colors.textColor};
         }
      }
   }
   .ant-menu > .ant-menu-item > .ant-menu-title-content {
      font-family: 'Maven Pro';
      font-size: ${theme.sizes.h8};
      letter-spaceing: 0.16em;
   }

   .ant-menu-horizontal > .ant-menu-item-selected {
      color: ${theme.colors.textColor};
      :after {
         border-bottom: 2px solid ${theme.colors.textColor};
         bottom: 0px;
      }
   }

   .ant-avatar {
      :hover {
         cursor: pointer;
      }
   }

   .cart-count-batch {
      position: absolute;
      top: 5px;
      left: ${({ cartCount }) => (cartCount > 9 ? '17px' : '22px')};
      color: ${theme.colors.tertiaryColor};
      font-size: ${theme.sizes.h8};
      font-weight: 700;
      text-align: center;
   }
   .spinner {
      top: 0;
      left: 10px;
   }
   .nav-list {
      list-style: none;
      display: flex;
      justify-content: space-between;
      align-items: center;
      text-align: center;
      padding: 0;
      margin: 0;
   }
   .nav-list-item {
      list-style: none;
      font-size: ${theme.sizes.h4};
      padding: 8px;
      margin-left: 1rem;
      position: relative;
      p {
         text-decoration: none;
         color: ${theme.colors.textColor4};
         padding: 8px 0;
      }
      a {
         font-family: 'Maven Pro';
         position: relative;
         text-decoration: none;
         color: ${theme.colors.textColor4};
         padding: 8px 0;

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
      a,
      a:before,
      a:after {
         transition: all 560ms;
      }
   }
   .menu-wrap {
      width: 100%;
      display: flex;
      align-items: center;
   }
   .action-btn {
      display: flex;
      align-items: center;
      justify-content: flex-start;
      column-gap: 1.5rem;
      margin-left: 1rem;
   }
   .cart,
   .profile {
      .ant-menu-horizontal > .ant-menu-item-selected:after {
         border: none;
      }
   }
   .brand {
      margin-left: 8px;
      a {
         color: ${theme.colors.tertiaryColor};
      }
   }
   .activeLink {
      color: ${theme.colors.textColor} !important;
      padding: 8 0px;
      border-bottom: ${`2px solid ${theme.colors.textColor}`};
      &:after,
      &:before {
         content: none;
      }
      &:hover {
         &:after {
            content: none;
         }
      }
   }
   .dropdownMenuBtn {
      position: relative;
      -webkit-text-decoration: none;
      text-decoration: none;
      color: #ffffff;
      background: none;
      border: none;
      font-size: 20px;
      cursor: pointer;
      padding: 8px 0;
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
      &:active {
         color: ${theme.colors.textColor} !important;
         padding: 8 0px;
         border-bottom: ${`2px solid ${theme.colors.textColor}`};
         &:after,
         &:before {
            content: none;
         }
      }
   }
   .dropdownMenuBtn,
   .dropdownMenuBtn:before,
   .dropdownMenuBtn:after {
      transition: all 560ms;
   }
   .spacer {
      display: flex;
      flex: 1;
   }
   .buttonWrapper {
      margin: 0 1rem;
      cursor: pointer;
   }
   .customBtn {
      height: 38px;
      min-width: 125px;
      font-family: 'Maven Pro';
      font-weight: 600;
      letter-spacing: 0.3em;
      padding: 0 2rem;
      display: flex;
      justify-content: center;
      align-items: center;
      color: ${theme.colors.textColor};
   }
   .auth-btn {
      position: absolute;
   }

   @media (max-width: 769px) {
      padding: 1rem;
      .menu-wrap {
         width: auto;
      }
      .action-btn {
         margin-left: 0;
      }
   }
`

export const DropdownWrapper = styled.div`
   width: 240px;
   overflow: hidden;
   transition: height 500ms ease;
   .dropdown-menu {
      width: 100%;
   }
   .dropdown-menu .dropdown-menu-item {
      display: flex;
      align-items: center;
      border-radius: 4px;
      transition: background 500ms;
      padding: 4px;
      margin: 12px 0;
      .icon-button {
         margin-right: 0.5rem;
         &:hover {
            filter: none;
         }
      }
      &:hover {
         cursor: pointer;
         background-color: #525357;
      }

      .icon-right {
         margin-left: auto;
         :hover {
            svg {
               stroke: ${theme.colors.textColor};
            }
         }
      }

      img {
         width: 100px;
         height: 60px;
         object-fit: cover;
         margin-right: 8px;
      }
      .title {
         font-size: ${theme.sizes.h8};
         color: ${theme.colors.textColor4};
         text-align: left;
         margin-bottom: 0;
      }
      .profileFont {
         font-size: ${theme.sizes.h9};
      }
   }
   .menu-primary-enter {
      position: absolute;
      transform: translateX(-110%);
   }
   .menu-primary-enter-active {
      transform: translateX(0%);
      transition: all 500ms ease;
   }
   .menu-primary-exit {
      position: absolute;
   }
   .menu-primary-exit-active {
      transform: translateX(-110%);
      transition: all 500ms ease;
   }

   .menu-secondary-enter {
      transform: translateX(110%);
   }
   .menu-secondary-enter-active {
      transform: translateX(0%);
      transition: all 500ms ease;
   }
   .menu-secondary-exit {
   }
   .menu-secondary-exit-active {
      transform: translateX(110%);
      transition: all 500ms ease;
   }
`

export const FloatingWrapper = styled.div`
   .floating-button {
      display: ${({ shouldVisible }) => (shouldVisible ? 'block' : 'none')};
      padding: 8px;
      position: fixed;
      bottom: 20px;
      right: 20px;
      z-index: 8;
      border-radius: 50%;
      box-shadow: ${({ isFloatingButtonVisible }) =>
         isFloatingButtonVisible ? 'none' : '2px 2px 8px #777'};

      background: ${({ isFloatingButtonVisible }) =>
         isFloatingButtonVisible ? 'transparent' : theme.colors.secondaryColor};
      &:hover {
         cursor: pointer;
         background: ${({ isFloatingButtonVisible }) =>
            isFloatingButtonVisible && theme.colors.primaryColor};
      }
      .cart-count-batch {
         position: absolute;
         top: 5px;
         left: ${({ cartCount }) => (cartCount > 9 ? '17px' : '22px')};
         color: ${theme.colors.textColor4};
         font-size: ${theme.sizes.h8};
         font-weight: 700;
         text-align: center;
      }

      @media (min-width: 769px) {
         display: none;
      }
   }
   .floating-button-main {
      display: ${({ isFloatingButtonVisible }) =>
         isFloatingButtonVisible ? 'block' : 'none'};
      opacity: ${({ isFloatingButtonVisible }) =>
         isFloatingButtonVisible ? '1' : '0'};
      position: fixed;
      bottom: 20px;
      right: 20px;
      z-index: 7;
      background: linear-gradient(228.17deg, #7ab6d3 0.03%, #294460 95.55%);
      transition: opacity 250ms;
      box-shadow: 2px 2px 8px #777;
      border-radius: 4px 4px 30px 4px;
      max-height: 350px;
      max-width: 280px;
      overflow-y: auto;

      .nav-list {
         list-style: none;
         display: flex;
         flex-direction: column;
         justify-content: flex-end;
         padding: 16px;
         margin: 0;
      }
      .nav-list-item {
         list-style: none;
         font-size: ${theme.sizes.h4};
         padding: 8px;
         position: relative;
         margin: 8px;
         display: flex;
         align-items: center;
         &:hover {
            background-color: #a5a5a5;
         }
         &:last-child {
            margin-bottom: 32px;
         }
         img {
            width: 100px;
            height: 60px;
            object-fit: cover;
            margin-right: 8px;
         }
         .title {
            font-size: ${theme.sizes.h8};
            color: ${theme.colors.textColor4};
            text-align: left;
         }
      }

      .delete-icon-onright {
         margin-left: 6px;
      }
   }
`
export const SidebarWrapper = styled(Drawer)`
   .ant-drawer-content {
      background: ${theme.colors.darkBackground.darkblue};
   }
   .ant-drawer-header {
      background: ${theme.colors.darkBackground.darkblue};
      border: none;
   }
   .ant-drawer-title {
      color: ${theme.colors.textColor4};
      font-size: ${theme.sizes.h4};
      font-weight: 700;
      .brand-logo-div {
         width: 100%;
         height: 48px;
         display: flex;
         align-items: center;
         .logo-img {
            width: 100px;
            height: 48px;
            object-fit: contain;
         }
      }
   }
   .ant-drawer-close {
      color: ${theme.colors.textColor4};
   }
   .ant-layout-sider {
      width: 100% !important;
      min-width: 100% !important;
      max-width: 100% !important;
      height: 100% !important;
   }
   .ant-menu {
      background: ${theme.colors.darkBackground.darkblue};
      color: ${theme.colors.textColor4};
   }
   .ant-menu-item {
      :hover {
         color: inherit;
      }
   }
   .ant-menu > .ant-menu-item > .ant-menu-title-content {
      font-family: 'Maven Pro';
      font-size: ${theme.sizes.h8};
      letter-spaceing: 0.16em;
   }
   .ant-menu-item-selected {
      color: ${theme.colors.textColor4};
      background: rgba(255, 255, 255, 0.1) !important;
      .ant-menu-title-content {
         svg path {
            fill: ${theme.colors.textColor};
         }
      }
   }
   .ant-menu-inline .ant-menu-item::after {
      left: 0;
      right: unset;
      border-right-color: ${theme.colors.textColor};
   }
   .custom-auth-btn {
      width: auto;
      height: 35px;
      padding: 0 16px;
   }
`
