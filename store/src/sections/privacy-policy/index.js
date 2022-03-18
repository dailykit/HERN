import React from 'react'
import ReactHtmlParser from 'react-html-parser'
import { useConfig } from '../../lib'

export const PrivacyPolicy = () => {
   const { settings } = useConfig('brand')
   const PrivacyPolicy =
      settings?.brand?.['Privacy Policy']?.['Privacy Policy']?.value ?? ''

   return (
      <div className="hern-privacy-policy">
         <h1 className="hern-privacy-policy__heading">Privacy policy</h1>
         <div className="hern-privacy-policy__content">
            <article className="hern-privacy-policy__article">
               {ReactHtmlParser(PrivacyPolicy)}
            </article>
         </div>
      </div>
   )
}
