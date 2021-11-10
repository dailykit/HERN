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
      <StyledWrapper bgMode="light">
         <Wrapper>
            <h1 className="customExperience_heading Barlow-Condensed text2">
               Want to curate your own experience?
            </h1>
            <PopupButton
               id={CUSTOM_EXPERIENCE_TYPEFORM_ID}
               className="customExperience_customBtn text7"
            >
               Customize
            </PopupButton>
         </Wrapper>
         <h2 className="customExperience_subHeading text6">
            We'll help you create a custom experience for your event.
         </h2>
      </StyledWrapper>
   )
}
const StyledWrapper = styled.div`
   height: 480px;
   .customExperience_subHeading {
      padding: 0.5rem;
      font-family: 'Barlow Condensed';
      font-weight: 700;
      text-align: left;
      color: ${({ bgMode = 'dark' }) =>
         bgMode === 'light'
            ? theme.colors.textColor5
            : theme.colors.textColor4};
      letter-spacing: 0.16em;
      :hover {
         color: ${theme.colors.textColor};
      }
   }
`
const Wrapper = styled.div`
   height: 360px;
   border-radius: 16px;
   padding: 2rem;
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
      font-family: 'Maven Pro';
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
