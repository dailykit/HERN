import React from 'react'
import tw, { styled } from 'twin.macro'
import { useSubscription } from '@apollo/react-hooks'

import { Faq } from '../Faq'
import { FAQ } from '../../graphql'

export const FaqSection = ({ page, identifier }) => {
   const { loading, data: { faq = [] } = {} } = useSubscription(FAQ, {
      variables: {
         page: { _eq: page },
         identifier: {
            _eq: identifier,
         },
      },
   })
   if (loading)
      return (
         <Wrapper>
            <header css={tw`flex flex-col items-center`}>
               <div tw="w-5/12 h-6 bg-gray-100 rounded-full" />
               <div tw="mt-3 w-8/12 h-5 bg-gray-100 rounded-full" />
            </header>
            <ul tw="mt-5 space-y-3">
               <li tw="h-12 bg-gray-100" />
               <li tw="h-12 bg-gray-100" />
               <li tw="h-12 bg-gray-100" />
            </ul>
         </Wrapper>
      )
   if (faq.length === 0) return null
   return (
      <Faq heading={faq[0].heading}>
         {faq[0].blocks.map(block => (
            <Faq.Item
               key={block.id}
               question={block.title}
               answer={block.description}
            />
         ))}
      </Faq>
   )
}

const Wrapper = styled.div`
   margin: 0 auto;
   max-width: 980px;
   padding: 48px 0;
   width: calc(100% - 40px);
`
