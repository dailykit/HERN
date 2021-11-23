import React from 'react'
import en from '../lang/en.json'
import fr from '../lang/fr.json'
import ar from '../lang/ar.json'

import { IntlProvider, FormattedMessage } from 'react-intl'

const LanguageContext = React.createContext()

const languages = { en, fr, ar }
const rltLanguages = ['ar'] //Languages are read from right to left

export const LanguageProvider = ({ children }) => {
   const [locale, changeLocale] = React.useState('en')
   const [direction, changeDirection] = React.useState('ltr')

   //Change direction for right to left read languages
   React.useEffect(() => {
      if (rltLanguages.includes(locale)) {
         changeDirection('rtl')
      } else {
         changeDirection('ltr')
      }
   }, [locale])

   return (
      <LanguageContext.Provider
         value={{ locale, changeLocale, direction, changeDirection }}
      >
         <IntlProvider locale={locale} messages={languages[locale]}>
            {children}
         </IntlProvider>
      </LanguageContext.Provider>
   )
}

export const useTranslation = () => {
   const { locale, changeLocale, direction, changeDirection } =
      React.useContext(LanguageContext)

   const locales = [
      { langCode: 'en', title: 'English' },
      { langCode: 'ar', title: 'عربي' },
      { langCode: 'fr', title: 'français' },
   ]

   const t = text => {
      console.log(text)
      return <FormattedMessage id={text} />
   }

   return {
      locales,
      locale,
      changeLocale,
      direction,
      changeDirection,
      t,
   }
}
