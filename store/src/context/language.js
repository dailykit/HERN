import React from 'react'
import en from '../lang/en.json'
import fr from '../lang/fr.json'
import ar from '../lang/ar.json'
import nl from '../lang/nl.json'

import { IntlProvider, FormattedMessage } from 'react-intl'
import { isClient, isKiosk } from '../utils'
const LanguageContext = React.createContext()

const languages = { en, fr, ar, nl }
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
      {
         langCode: 'fr',
         title: 'French',
         default: true,
         flagIcon: 'https://flagicons.lipis.dev/flags/4x3/fr.svg',
         direction: 'ltr',
      },
      {
         langCode: 'nl',
         title: 'Dutch',
         default: true,
         flagIcon: 'https://flagicons.lipis.dev/flags/4x3/nl.svg',
         direction: 'ltr',
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
      // JSON.parse(localStorage.getItem('language'))
      if (rltLanguages.includes(locale)) {
         changeDirection('rtl')
      } else {
         changeDirection('ltr')
      }
   }, [locale])

   const kiosk = isKiosk()

   React.useEffect(() => {
      if (!kiosk) {
         const languageInLocal = isClient
            ? window.localStorage.getItem('language')
            : ''
         if (languageInLocal == 'ar') {
            changeLocale('ar')
         } else if (languageInLocal == 'fr') {
            changeLocale('fr')
         } else if (languageInLocal == 'nl') {
            changeLocale('nl')
         } else if (languageInLocal == 'en') {
            changeLocale('en')
         }
      }
   }, [])
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
      if (text) {
         return <FormattedMessage id={text} />
      } else return text
   }
   const dynamicTrans = langTags => {
      langTags.forEach(tag => {
         let langPattern
         if (tag.hasAttribute('data-original-value')) {
            langPattern = tag.getAttribute('data-original-value')
         } else {
            langPattern = tag.innerHTML
            tag.setAttribute('data-original-value', langPattern)
         }
         let innerHTMLToBe = langPattern
         if (locale === 'en') {
            if (
               (langPattern && langPattern.match(/\@@AR@@(.*?)\@@AR@@/g)) ||
               langPattern.match(/\@@FR@@(.*?)\@@FR@@/g) ||
               langPattern.match(/\@@NL@@(.*?)\@@NL@@/g)
            ) {
               const arabic = langPattern.match(/\@@AR@@(.*?)\@@AR@@/g)?.[0]
               const french = langPattern.match(/\@@FR@@(.*?)\@@FR@@/g)?.[0]
               const dutch = langPattern.match(/\@@NL@@(.*?)\@@NL@@/g)?.[0]
               innerHTMLToBe = langPattern
                  .replaceAll(french, '')
                  ?.replaceAll(arabic, '')
                  ?.replaceAll(dutch, '')
            }
            tag.innerHTML = innerHTMLToBe
         }
         if (locale === 'ar') {
            if (langPattern && langPattern.match(/\@@AR@@(.*?)\@@AR@@/g)) {
               tag.innerHTML = langPattern
                  .match(/\@@AR@@(.*?)\@@AR@@/g)[0]
                  .replaceAll('@@AR@@', '')
            }
         }
         if (locale === 'fr') {
            if (langPattern && langPattern.match(/\@@FR@@(.*?)\@@FR@@/g)) {
               tag.innerHTML = langPattern
                  .match(/\@@FR@@(.*?)\@@FR@@/g)[0]
                  .replaceAll('@@FR@@', '')
            }
         }
         if (locale === 'nl') {
            if (langPattern && langPattern.match(/\@@NL@@(.*?)\@@NL@@/g)) {
               tag.innerHTML = langPattern
                  .match(/\@@NL@@(.*?)\@@NL@@/g)[0]
                  .replaceAll('@@NL@@', '')
            }
         }
      })
   }

   const currentLang = React.useMemo(() => locale, [locale])

   React.useEffect(() => {
      const languageTags = document.querySelectorAll(
         '[data-translation="true"]'
      )
      dynamicTrans(languageTags)
      console.log('current language', currentLang)
   }, [currentLang])

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
