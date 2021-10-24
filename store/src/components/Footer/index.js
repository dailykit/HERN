import React from 'react'
import ReactHtmlParser from 'react-html-parser'
import { isEmpty } from '../../utils'

export default function Footer({ footerHtml }) {
   return (
      <div id="stayin_footer">
         {!isEmpty(footerHtml) && ReactHtmlParser(footerHtml)}
      </div>
   )
}
