import React from 'react'
import tw from 'twin.macro'
import ReactHtmlParser from 'react-html-parser'
import { StyledArticle } from '../../components'
import { useConfig } from '../../lib'

export const RefundPolicy = () => {
   const { value } = useConfig('brand').configOf('Refund Policy')
   return (
      <div tw="min-h-full text-gray-600 md:mx-64 mx-10 mb-4">
         <h1 tw="my-10  text-5xl text-gray-800 text-center py-2 border-gray-200 border-b-2">
            Refund Policy
         </h1>
         <div tw="text-lg">
            <StyledArticle>{ReactHtmlParser(value)}</StyledArticle>
         </div>
      </div>
   )
}
