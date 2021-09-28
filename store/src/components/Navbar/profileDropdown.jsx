import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import { CSSTransition } from "react-transition-group";
import { useToasts } from "react-toast-notifications";
import { DropdownWrapper } from "./styles";
import { Spacer } from "../../components";
import { theme } from "../../theme";
import { isClient } from "../../utils";
import {
  PollIcon,
  BookingIcon,
  LogoutIcon,
  DashboardIcon,
} from "../../components/Icons";

export default function ProfileDropdownMenu({ items, user, ...props }) {
  const router = useRouter();
  const { addToast } = useToasts();
  const [activeMenu, setActiveMenu] = useState(items[0]?.id);
  const [menuHeight, setMenuHeight] = useState(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    console.log(
      "dropdownRef.current",
      dropdownRef.current.firstChild.offsetHeight
    );
    setMenuHeight(dropdownRef.current?.firstChild.offsetHeight + 30);
  }, []);

  function calcHeight(el) {
    console.log("CalcHeight......", el);
    const height = el.offsetHeight;
    console.log("height", height);
    setMenuHeight(height);
  }

  const handleClick = (url) => {
    if (url !== "logout") {
      router.push(`${url}`);
    } else {
      isClient && localStorage.removeItem("token");
      if (isClient) {
        window.location.href = window.location.origin + "";
      }
    }
  };

  const DropdownMenuItem = ({ children, url }) => {
    return (
      <div className="dropdown-menu-item" onClick={() => handleClick(url)}>
        {children}
      </div>
    );
  };

  return (
    <DropdownWrapper {...props} ref={dropdownRef}>
      <div className="pointer" />
      <p style={{ color: theme.colors.textColor4, textAlign: "center" }}>
        {user?.email}
      </p>
      <CSSTransition
        in={activeMenu === items[0]?.id}
        unmountOnExit
        timeout={500}
        classNames="menu-primary"
        onEnter={calcHeight}
      >
        <div className="dropdown-menu">
          <DropdownMenuItem url="/dashboard">
            <DashboardIcon size="24" color={theme.colors.textColor4} />
            <Spacer xAxis="16px" />
            <p className="title profileFont">Dashboard</p>
          </DropdownMenuItem>
          <DropdownMenuItem url="/myPolls">
            <PollIcon
              size="24"
              backgroundColor={theme.colors.textColor4}
              color={theme.colors.mainBackground}
            />
            <Spacer xAxis="16px" />
            <p className="title profileFont">My Polls</p>
          </DropdownMenuItem>
          <DropdownMenuItem url="/myBookings">
            <BookingIcon
              size="24"
              backgroundColor={theme.colors.textColor4}
              color={theme.colors.mainBackground}
            />
            <Spacer xAxis="16px" />
            <p className="title profileFont ">My Bookings</p>
          </DropdownMenuItem>
          <DropdownMenuItem url="logout">
            <LogoutIcon
              size="24"
              backgroundColor={theme.colors.textColor}
              color={theme.colors.textColor4}
            />
            <Spacer xAxis="16px" />
            <p className="title profileFont ">Logout</p>
          </DropdownMenuItem>
        </div>
      </CSSTransition>
    </DropdownWrapper>
  );
}
