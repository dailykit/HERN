import React from 'react'
import ReactHtmlParser from 'react-html-parser'
import { useConfig } from '../../lib'

export const RefundPolicy = () => {
   const { value } = useConfig('brand').configOf('Refund Policy')
   return (
      <div className="hern-refund-policy">
         <h1 className="hern-refund-policy__heading">Refund Policy</h1>
         <div className="hern-refund-policy__content">
            <article className="hern-refund-policy__article">
               {ReactHtmlParser(value)}
            </article>
         </div>
      </div>
   )
}
