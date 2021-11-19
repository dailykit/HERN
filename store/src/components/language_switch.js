import React from 'react'
import { useTranslation } from '../context'

export const LanguageSwitch = () => {
   const { changeLocale, locales } = useTranslation()

   return (
      <select onChange={e => changeLocale(e.target.value)}>
         {locales.map(locale => (
            <option key={locale.langCode} value={locale.langCode}>
               {locale.title}
            </option>
         ))}
      </select>
   )
}
