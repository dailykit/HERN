import React from "react";
import styled from "styled-components";
import { theme } from "../../../../theme";

export default function Counter({ productQuantity, handleQtyUpdate }) {
  return (
    <Wrapper>
      <span className="customButton" onClick={(e) => handleQtyUpdate(e, "dec")}>
        -
      </span>
      <p className="productQty">{productQuantity}</p>
      <span className="customButton" onClick={(e) => handleQtyUpdate(e, "inc")}>
        +
      </span>
    </Wrapper>
  );
}

const Wrapper = styled.div`
  color: ${theme.colors.textColor4};
  display: flex;
  align-items: center;
  .productQty {
    margin: 0 0.5rem;
  }
  .customButton {
    width: 25px;
    height: 25px;
    font-size: ${theme.sizes.h9};
    border: none;
    cursor: pointer;
  }
`;
