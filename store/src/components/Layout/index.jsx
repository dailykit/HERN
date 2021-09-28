import React from "react";
import Navbar from "../Navbar";

const Layout = ({ children, noHeader, navigationMenuItems = [] }) => {
  return (
    <>
      {!noHeader && <Navbar navigationMenuItems={navigationMenuItems} />}
      {children}
    </>
  );
};

export default Layout;
