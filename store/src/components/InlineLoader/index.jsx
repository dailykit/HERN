import React from "react";

import { StyledLoader, StyledWrapper } from "./styled";
const InlineLoader = () => {
  return (
    <StyledWrapper>
      <StyledLoader>
        <div />
        <div />
        <div />
        <div />
      </StyledLoader>
    </StyledWrapper>
  );
};

export default InlineLoader;
