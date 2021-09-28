import React, { useCallback } from "react";
import { BackDropDiv } from "./styles";

export default function BackDrop({ show, close, children }) {
  const handleClickBackdrop = useCallback(
    (e) => {
      const { id } = e.target;
      if (id === "backdrop-div") close();
    },
    [close]
  );
  return (
    <BackDropDiv id="backdrop-div" show={show} onClick={handleClickBackdrop}>
      {children}
    </BackDropDiv>
  );
}
