import React from 'react'
import { PopupButton } from '@typeform/embed-react'
import styled from 'styled-components'
import { get_env } from '../../../utils'
import { theme } from '../../../theme'
export default function CustomExperience() {
   const CUSTOM_EXPERIENCE_TYPEFORM_ID = get_env(
      'CUSTOM_EXPERIENCE_TYPEFORM_ID'
   )
   return (
      <Wrapper>
         <h1 className="customExperience_heading League-Gothic text1">
            Want to curate your own experience?
         </h1>
         <PopupButton
            id={CUSTOM_EXPERIENCE_TYPEFORM_ID}
            className="customExperience_customBtn text7"
         >
            Customize
         </PopupButton>
      </Wrapper>
   )
}

const Wrapper = styled.div`
   height: 480px;
   border-radius: 16px;
   padding: 2rem 1rem;
   background: ${theme.colors.textColor};
   display: flex;
   flex-direction: column;
   justify-content: space-around;
   .customExperience_heading {
      color: ${theme.colors.textColor4};
   }
   .customExperience_customBtn {
      height: 38px;
      color: ${theme.colors.textColor4};
      border: 1px solid ${theme.colors.textColor4};
      background: ${theme.colors.textColor};
      border-radius: 24px;
      text-align: center;
      text-transform: uppercase;
      font-family: Proxima Nova;
      font-style: normal;
      font-weight: 800;
      letter-spacing: 0.16em;
      :hover {
         border: none;
         background: ${theme.colors.textColor4};
         color: ${theme.colors.textColor};
         cursor: pointer;
      }
   }
`
