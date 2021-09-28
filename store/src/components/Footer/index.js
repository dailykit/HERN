import React from "react";
import NavLink from "next/link";
import { FooterWrapper } from "./styles";

export default function Footer() {
  return (
    <FooterWrapper id="main-footer">
      <ul className="nav-list">
        <li>
          <NavLink href="/">
            <div className="nav-list-item" />
          </NavLink>
        </li>
        <li>
          <NavLink href="/experiences">
            <div className="nav-list-item" />
          </NavLink>
        </li>
        <li>
          <NavLink href="/experts">
            <div className="nav-list-item" />
          </NavLink>
        </li>
      </ul>
    </FooterWrapper>
  );
}
