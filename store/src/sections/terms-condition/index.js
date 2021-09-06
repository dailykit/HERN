import React from 'react'
import { StyledArticle } from '../../components'
import tw from 'twin.macro'
import ReactHtmlParser from 'react-html-parser'
import { useConfig } from '../../lib'

export const TermsAndConditions = () => {
   const { value } = useConfig('brand').configOf('Terms and Conditions')

   return (
      <div className="hern-terms-condition">
         <h1 className="hern-terms-condition__heading">
            Terms &amp; Conditions
         </h1>
         <div className="hern-terms-condition__content">
            <article className="hern-terms-condition__article">
               {ReactHtmlParser(value)}
            </article>
         </div>
      </div>
   )
}
