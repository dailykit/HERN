import React from 'react'
import en from '../lang/en.json'
import fr from '../lang/fr.json'
import ar from '../lang/ar.json'

import { IntlProvider, FormattedMessage } from 'react-intl'

const LanguageContext = React.createContext()

const languages = { en, fr, ar }
const rltLanguages = ['ar'] //Languages are read from right to left

export const LanguageProvider = ({ children }) => {
   const locales = [
      {
         langCode: 'en',
         title: 'English',
         default: true,
         flagIcon: 'https://flagicons.lipis.dev/flags/4x3/um.svg',
         direction: 'ltr',
      },
      {
         langCode: 'ar',
         title: 'عربي',
         default: false,
         flagIcon: 'https://flagicons.lipis.dev/flags/4x3/sa.svg',
         direction: 'rtl',
      },
   ]
   const [locale, changeLocale] = React.useState(
      locales.find(x => x.default).langCode
   )
   const [direction, changeDirection] = React.useState(
      locales.find(x => x.default).direction
   )

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
         value={{ locale, changeLocale, direction, changeDirection, locales }}
      >
         <IntlProvider locale={locale} messages={languages[locale]}>
            {children}
         </IntlProvider>
      </LanguageContext.Provider>
   )
}

export const useTranslation = () => {
   const { locale, changeLocale, direction, changeDirection, locales } =
      React.useContext(LanguageContext)

   const t = text => {
      return <FormattedMessage id={text} />
   }
   const dynamicTrans = (strings, currentLang) => {
      strings.forEach(x => {
         if (currentLang === 'en') {
            if (x.innerHTML.match(/\##EN##(.*?)\##EN##/g)) {
               x.innerHTML = x.innerHTML
                  .match(/\##EN##(.*?)\##EN##/g)[0]
                  .replaceAll('##EN##', '')
            }
         }
         if (currentLang === 'ar') {
            if (x.innerHTML.match(/\##AR##(.*?)\##AR##/g)) {
               x.innerHTML = x.innerHTML
                  .match(/\##AR##(.*?)\##AR##/g)[0]
                  .replaceAll('##AR##', '')
            }
         }
      })
   }

   return {
      locales,
      locale,
      changeLocale,
      direction,
      changeDirection,
      t,
      dynamicTrans,
   }
}
