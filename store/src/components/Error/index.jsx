import React from "react";
import { ErrorDiv } from "./styles";
import { ErrorIcon } from "../Icons";
import { theme } from "../../theme";

const Error = ({ children, ...props }) => {
  return (
    <ErrorDiv {...props}>
      <span>
        <ErrorIcon size={theme.sizes.h8} color={theme.colors.tertiaryColor} />
      </span>
      <p>{children}</p>
    </ErrorDiv>
  );
};
export default Error;
