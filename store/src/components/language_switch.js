import React from 'react'
import { useTranslation } from '../context'

export const LanguageSwitch = () => {
   const { changeLocale, locales, locale: currentLang } = useTranslation()

   return (
      <select onChange={e => {
         changeLocale(e.target.value);
         window.localStorage.setItem('language', e.target.value)
      }
      }>
         {locales.map(locale => (
            <option key={locale.langCode} value={locale.langCode} selected={locale.langCode == currentLang}>
               {locale.title}
            </option>
         ))}
      </select>
   )
}
