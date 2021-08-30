import React from 'react'
import { StyledArticle } from '../../components'
import tw from 'twin.macro'
import ReactHtmlParser from 'react-html-parser'
import { useConfig } from '../../lib'

export const TermsAndConditions = () => {
   const { value } = useConfig('brand').configOf('Terms and Conditions')

   return (
      <div tw="min-h-screen text-gray-600 md:mx-64 mx-10 mb-4">
         <h1 tw="my-10  text-5xl text-gray-800 text-center py-2 border-gray-200 border-b-2">
            Terms &amp; Conditions
         </h1>
         <div tw="text-lg">
            <StyledArticle>{ReactHtmlParser(value)}</StyledArticle>
         </div>
      </div>
   )
}
