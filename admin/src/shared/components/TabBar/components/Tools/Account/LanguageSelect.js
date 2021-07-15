import React from 'react'
import styled from 'styled-components'
import i18next from 'i18next'

const LanguageSelect = ({ getFullLanguageName, setLang, setIsVisible }) => {
   const changeLang = lang => {
      i18next.changeLanguage(lang, () => {
         setLang(lang)
         setIsVisible(true)
      })
   }
   const languages = ['en', 'fr', 'es', 'he', 'it', 'de', 'hi']
   return (
      <>
         <StyledButton onClick={() => setIsVisible(true)}>
            <svg
               width="6"
               height="9"
               viewBox="0 0 6 9"
               fill="none"
               xmlns="http://www.w3.org/2000/svg"
            >
               <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M5.21193 0.188289C4.9613 -0.0627628 4.55496 -0.0627628 4.30433 0.188289L-9.77516e-05 4.5L4.30433 8.81171C4.55496 9.06276 4.9613 9.06276 5.21193 8.81171C5.46256 8.56066 5.46256 8.15363 5.21193 7.90257L1.81511 4.5L5.21193 1.09743C5.46256 0.846375 5.46256 0.43934 5.21193 0.188289Z"
                  fill="#919699"
               />
            </svg>

            <span>Languages</span>
         </StyledButton>
         {languages.map(lang => {
            return (
               <StyledLang key={lang} onClick={() => changeLang(lang)}>
                  {getFullLanguageName(lang)}
               </StyledLang>
            )
         })}
      </>
   )
}

export default LanguageSelect

const StyledLang = styled.div`
   padding: 12px;
   font-style: normal;
   font-weight: bold;
   font-size: 14px;
   line-height: 16px;
   text-transform: uppercase;
   color: #64696e;
   border-bottom: 1px solid #f2f3f3;
   cursor: pointer;
`
const StyledButton = styled.div`
   font-family: Roboto;
   font-style: normal;
   font-weight: bold;
   font-size: 10px;
   display: flex;
   align-items: baseline;
   letter-spacing: 0.44px;
   text-transform: uppercase;
   color: #919699;
   padding: 12px;
   cursor: center;
   > span {
      margin-left: 8px;
   }
`
