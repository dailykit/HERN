import React from 'react'
import i18next from 'i18next'

import {
   StyledWrapper,
   IconContainer,
   StyledList,
   StyledListItem,
} from './styled'
import { SettingsIcon } from '../../assets/icons'

const Lang = () => {
   const [lang, setLang] = React.useState(
      localStorage.getItem('i18nextLng') || 'en'
   )
   const [isVisible, setIsVisible] = React.useState(false)

   const changeLang = lang => {
      i18next.changeLanguage(lang, () => {
         setLang(lang)
         setIsVisible(false)
      })
   }

   return (
      <StyledWrapper>
         <StyledList hidden={!isVisible}>
            <StyledListItem
               active={lang === 'en'}
               onClick={() => changeLang('en')}
            >
               English
            </StyledListItem>
            <StyledListItem
               active={lang === 'fr'}
               onClick={() => changeLang('fr')}
            >
               Français
            </StyledListItem>
            <StyledListItem
               active={lang === 'es'}
               onClick={() => changeLang('es')}
            >
               Español
            </StyledListItem>
            <StyledListItem
               active={lang === 'he'}
               onClick={() => changeLang('he')}
            >
               עברית
            </StyledListItem>
            <StyledListItem
               active={lang === 'it'}
               onClick={() => changeLang('it')}
            >
               Italiano
            </StyledListItem>
            <StyledListItem
               active={lang === 'de'}
               onClick={() => changeLang('de')}
            >
               Deutsche
            </StyledListItem>
            <StyledListItem
               active={lang === 'hi'}
               onClick={() => changeLang('hi')}
            >
               हिन्दी
            </StyledListItem>
         </StyledList>
         <IconContainer onClick={() => setIsVisible(!isVisible)}>
            <SettingsIcon color="#28C1F6" size={32} />
         </IconContainer>
      </StyledWrapper>
   )
}

export default Lang
