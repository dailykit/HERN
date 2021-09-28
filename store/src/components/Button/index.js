import React from "react";
import { StyledButton, CircularButton } from "./styles.js";

export default function Button({ className, children, ...props }) {
  if (props.btnType === "circle") {
    return (
      <CircularButton className={className} {...props}>
        {children}
      </CircularButton>
    );
  } else {
    return (
      <StyledButton className={className} {...props}>
        {children}
      </StyledButton>
    );
  }
}
