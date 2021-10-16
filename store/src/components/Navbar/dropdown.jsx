import React, { useState, useEffect, useRef } from "react";
import NavLink from "next/link";
import { CSSTransition } from "react-transition-group";
import { DropdownWrapper } from "./styles";
import { ChevronRight, ChevronLeft, CheckCircle } from "../Icons";

export default function DropdownMenu({ items }) {
  const [activeMenu, setActiveMenu] = useState(items[0]?.label);
  const [menuHeight, setMenuHeight] = useState(null);
  const dropdownRef = useRef(null);
  console.log(menuHeight);

  useEffect(() => {
    setMenuHeight(dropdownRef.current?.firstChild.offsetHeight + 30);
  }, []);

  function calcHeight(el) {
    console.log("CalcHeight......", el);
    const height = el.offsetHeight;
    console.log("height", height);
    setMenuHeight(height);
  }
  const DropdownMenuItem = ({
    leftIcon,
    rightIcon,
    children,
    goToMenu,
    url,
  }) => {
    return (
      // <NavLink
      //   className="dropdown-menu-item"
      //   href={`${url}`}
      //   onClick={() => goToMenu && setActiveMenu(goToMenu)}
      // >
      //   <a>
      <>
        <span className="icon-button">{leftIcon}</span>
        {children}
        <span className="icon-right">{rightIcon}</span>
      </>
      //   </a>
      // </NavLink>
    );
  };

  return (
    <DropdownWrapper style={{ height: menuHeight }} ref={dropdownRef}>
      <CSSTransition
        in={activeMenu === items[0]?.label}
        unmountOnExit
        timeout={500}
        classNames="menu-primary"
        onEnter={calcHeight}
      >
        <div className="dropdown-menu">
          {items.map((item) => {
            return (
              <DropdownMenuItem
                leftIcon="🦧"
                rightIcon={<ChevronRight size="18" color="#fff" />}
                goToMenu="settings"
                url={item?.url || "#"}
              >
                {item?.label}
              </DropdownMenuItem>
            );
          })}
        </div>
      </CSSTransition>
      <CSSTransition
        in={activeMenu === "settings"}
        timeout={500}
        classNames="menu-secondary"
        unmountOnExit
        onEnter={calcHeight}
      >
        <div className="menu">
          <DropdownMenuItem
            goToMenu="main"
            leftIcon={<ChevronLeft size="18" color="#fff" />}
          >
            <h2>My Tutorial</h2>
          </DropdownMenuItem>
          <DropdownMenuItem leftIcon={<CheckCircle size="18" color="#fff" />}>
            HTML
          </DropdownMenuItem>
          <DropdownMenuItem leftIcon={<CheckCircle size="18" color="#fff" />}>
            CSS
          </DropdownMenuItem>
          <DropdownMenuItem leftIcon={<CheckCircle size="18" color="#fff" />}>
            JavaScript
          </DropdownMenuItem>
          <DropdownMenuItem leftIcon={<CheckCircle size="18" color="#fff" />}>
            Awesome!
          </DropdownMenuItem>
        </div>
      </CSSTransition>
    </DropdownWrapper>
  );
}
