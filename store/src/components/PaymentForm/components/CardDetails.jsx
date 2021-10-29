import React from 'react'
import { CardElement } from '@stripe/react-stripe-js'
import styled from 'styled-components'
import { theme } from '../../../theme'

const CardSection = () => {
   const CARD_ELEMENT_OPTIONS = {
      style: {
         base: {
            color: theme.colors.textColor7,
            fontSize: theme.sizes.h8,
            '::placeholder': {
               color: theme.colors.textColor7
            }
         },
         invalid: {
            color: theme.colors.tertiaryColor,
            iconColor: theme.colors.tertiaryColor
         }
      }
   }
   return (
      <CardSectionWrapper>
         <span htmlFor="name" className="card_label text8">
            Card Details
         </span>
         <CardElement options={CARD_ELEMENT_OPTIONS} />
      </CardSectionWrapper>
   )
}

export default CardSection

const CardSectionWrapper = styled.div`
   display: flex;
   flex-direction: column;
   .StripeElement {
      width: 100%;
      height: 48px;
      border-radius: 0px;
      background: ${theme.colors.textColor4};
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
      font-family: 'Maven Pro';
      font-style: normal;
      font-weight: 600;
      letter-spacing: 0.3em;
      margin-bottom: 1rem;
      color: ${theme.colors.textColor7};
   }
`
