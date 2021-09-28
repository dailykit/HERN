import React from "react";
import { CardElement } from "@stripe/react-stripe-js";
import styled from "styled-components";
import { theme } from "../../../theme";

const CardSection = () => {
  const CARD_ELEMENT_OPTIONS = {
    style: {
      base: {
        color: theme.colors.textColor4,
        fontSize: theme.sizes.h8,
        "::placeholder": {
          color: theme.colors.textColor4,
        },
      },
      invalid: {
        color: theme.colors.tertiaryColor,
        iconColor: theme.colors.tertiaryColor,
      },
    },
  };
  return (
    <CardSectionWrapper>
      <span htmlFor="name" className="card_label">
        Card Details
      </span>
      <CardElement options={CARD_ELEMENT_OPTIONS} />
    </CardSectionWrapper>
  );
};

export default CardSection;

const CardSectionWrapper = styled.div`
  display: flex;
  flex-direction: column;
  .StripeElement {
    width: 100%;
    height: 48px;
    background: ${theme.colors.mainBackground};
    box-shadow: 1px 1px 2px rgb(50 56 72 / 30%),
      -1px -1px 2px rgb(17 19 24 / 50%), inset -5px 5px 10px rgb(17 19 24 / 20%),
      inset 5px -5px 10px rgb(17 19 24 / 20%),
      inset -5px -5px 10px rgb(50 56 72 / 90%),
      inset 5px 5px 13px rgb(17 19 24 / 90%);
    border-radius: 4px;
    border: none;
    padding: 16px;
  }
  .StripeElement--invalid {
    border-color: #fa755a;
  }
  .StripeElement--webkit-autofill {
    background-color: #fefde5 !important;
  }
  .card_label {
    font-size: ${theme.sizes.h8};
    color: ${theme.colors.textColor4};
    margin-bottom: 1rem;
  }
`;
