import React from "react";
import { Scrollbars } from "react-custom-scrollbars";

export default function CustomScrollbar({ children, ...rest }) {
  return (
    <Scrollbars
      style={{ width: "100%", height: "100%", scrollBehavior: "smooth" }}
      {...rest}
    >
      {children}
    </Scrollbars>
  );
}
