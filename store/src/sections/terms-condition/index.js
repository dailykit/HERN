import React from 'react'
import ReactHtmlParser from 'react-html-parser'
import { useConfig } from '../../lib'

export const TermsAndConditions = () => {
   const { settings } = useConfig('brand')

   const termsAndConditions =
      settings?.brand?.find(
         setting => setting.identifier === 'Terms and Conditions'
      )?.value?.['Terms and Conditions']?.value ?? ''

   return (
      <div className="hern-terms-condition">
         <h1 className="hern-terms-condition__heading">
            Terms &amp; Conditions
         </h1>
         <div className="hern-terms-condition__content">
            <article className="hern-terms-condition__article">
               {ReactHtmlParser(termsAndConditions)}
            </article>
         </div>
      </div>
   )
}
