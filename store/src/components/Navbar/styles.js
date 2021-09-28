import styled from "styled-components";
import { theme } from "../../theme";

export const NavBar = styled.nav`
  height: 64px;
  position: sticky;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 5;
  display: flex;
  align-items: center;
  padding: 1rem 8rem;
  justify-content: space-around;
  background: ${theme.colors.mainBackground};
  .brand-logo-div {
    width: 132px;
    height: 50px;
    display: flex;
    margin-right: 8px;
    align-items: center;
    position: relative;
  }

  @media (max-width: 769px) {
    display: none;
  }
  .cart-count-batch {
    position: absolute;
    top: 5px;
    left: ${({ cartCount }) => (cartCount > 9 ? "17px" : "22px")};
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
    a,
    a:before,
    a:after {
      transition: all 560ms;
    }
  }
  .cart,
  .profile {
    list-style: none;
    font-size: ${theme.sizes.h4};
    padding: 8px;
    margin-left: 1rem;
    position: relative;
    .dropdown-div {
      display: none;
    }
    .profile-dropdown-div {
      display: none;
    }
    &:hover {
      cursor: pointer;
      .dropdown-div {
        display: block;
      }
      .profile-dropdown-div {
        display: block;
      }
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
    font-size: ${theme.sizes.h6};
    min-width: 125px;
  }
  .auth-btn {
    position: absolute;
  }
`;

export const DropdownWrapper = styled.div`
  position: absolute;
  top: 58px;
  width: 300px;
  z-index: 6;
  transform: translateX(-45%);
  background: ${theme.colors.mainBackground};
  border: 1px solid #474a4d;
  border-radius: 4px;
  padding: 1rem;
  overflow: hidden;
  transition: height 500ms ease;
  .dropdown-menu {
    width: 100%;
  }
  .dropdown-menu .dropdown-menu-item {
    display: flex;
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
      background-color: #525357;
    }

    .icon-right {
      margin-left: auto;
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
  .pointer {
    position: absolute;
    pointer-events: none;
    border-style: solid;
    border-right-style: solid;
    border-bottom-style: solid;
    border-width: 1px;
    border-right-width: 1px;
    border-bottom-width: 1px;
    border-right: 1px solid rgb(203, 214, 226);
    border-bottom: 1px solid rgb(203, 214, 226);
    border-image: none 100% / 1 / 0 stretch;
    clip-path: polygon(100% 100%, 0px 100%, 100% 0px);
    border-top-left-radius: 100%;
    border-top-color: transparent !important;
    border-left-color: transparent !important;
    width: 15px;
    height: 15px;
    background-color: inherit;
    transform: rotate(-135deg);
    top: -6px;
    left: calc(50% - 10px);
    background: #fff;
  }
`;

export const FloatingWrapper = styled.div`
  .floating-button {
    display: ${({ shouldVisible }) => (shouldVisible ? "block" : "none")};
    padding: 8px;
    position: fixed;
    bottom: 20px;
    right: 20px;
    z-index: 8;
    border-radius: 50%;
    box-shadow: ${({ isFloatingButtonVisible }) =>
      isFloatingButtonVisible ? "none" : "2px 2px 8px #777"};

    background: ${({ isFloatingButtonVisible }) =>
      isFloatingButtonVisible ? "transparent" : theme.colors.secondaryColor};
    &:hover {
      cursor: pointer;
      background: ${({ isFloatingButtonVisible }) =>
        isFloatingButtonVisible && theme.colors.primaryColor};
    }
    .cart-count-batch {
      position: absolute;
      top: 5px;
      left: ${({ cartCount }) => (cartCount > 9 ? "17px" : "22px")};
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
      isFloatingButtonVisible ? "block" : "none"};
    opacity: ${({ isFloatingButtonVisible }) =>
      isFloatingButtonVisible ? "1" : "0"};
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
`;
export const SidebarWrapper = styled.div`
  .sidebar-icon {
    width: ${({ isSidebarButtonVisible }) =>
      isSidebarButtonVisible ? "auto" : "100%"};
    display: flex;
    align-items: center;
    justify-content: space-between;
    top: ${({ isSidebarButtonVisible }) =>
      isSidebarButtonVisible ? "8px" : "0"};
    left: ${({ isSidebarButtonVisible }) =>
      isSidebarButtonVisible ? "8px" : "0"};
    position: fixed;
    z-index: 12;
    border: ${({ isSidebarButtonVisible }) =>
      isSidebarButtonVisible ? `1px solid ${theme.colors.textColor4}` : "none"};
    border-radius: 4px;
    padding: ${({ isSidebarButtonVisible }) =>
      isSidebarButtonVisible ? "0" : "16px"};
    height: ${({ isSidebarButtonVisible }) =>
      isSidebarButtonVisible ? "auto" : "64px"};
    margin: 0;
    background: ${theme.colors.mainBackground};
    &:hover {
      cursor: pointer;
    }
    .brand-logo-div {
      display: ${({ isSidebarButtonVisible }) =>
        isSidebarButtonVisible ? "none" : "block"};
      width: 100px;
      height: 40px;
      margin-right: 16px;
      position: relative;
    }
    @media (min-width: 769px) {
      display: none;
    }
  }
  .custom-auth-btn {
    width: auto;
    height: 35px;
    padding: 0 16px;
  }
  .sidebar-main {
    width: 70%;
    height: 100%;
    padding: 64px 16px 16px 16px;
    position: fixed;
    top: 0;
    left: ${({ isSidebarButtonVisible }) =>
      isSidebarButtonVisible ? "0" : "-100%"};
    z-index: 11;
    box-shadow: -31px 31px 62px rgba(20, 23, 30, 0.2),
      -31px 39px 78px rgba(20, 23, 30, 0.9);
    color: ${theme.colors.textColor4};
    background: ${theme.colors.mainBackground};
    transition: 650ms;
    .nav-list {
      list-style: none;
      display: flex;
      flex-direction: column;
      justify-content: flex-end;
      margin: 0;
      .brand-logo-div {
        width: 132px;
        height: 50px;
        display: flex;
        align-items: center;
        margin-bottom: 16px;
        .logo-img-1 {
          width: 100%;
          height: 100%;
        }
        .logo-img-2 {
          width: 60px;
          height: 90px;
          object-fit: cover;
        }
        .logo-img-3 {
          width: 100%;
          height: 40px;
        }
      }
    }
    .nav-list-item {
      list-style: none;
      font-size: ${theme.sizes.h4};
      position: relative;
      display: flex;
      flex-direction: column;
      &:hover {
        background: ${theme.colors.secondaryColor};
      }
      &:last-child {
        margin-bottom: 32px;
      }
      a {
        position: relative;
        padding: 8px;
        text-decoration: none;
        color: ${theme.colors.textColor4};
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
    .activeLink {
      background: ${theme.colors.secondaryColor};
    }

    .delete-icon-onright {
      margin-left: 6px;
    }
  }
`;
