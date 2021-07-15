import React from 'react'
import tw, { styled } from 'twin.macro'

export const ProductSkeleton = () => {
   return (
      <Wrapper>
         <aside tw="w-32 h-16 bg-gray-300 rounded" />
         <main tw="w-full h-16 pl-3">
            <span />
            <span />
         </main>
      </Wrapper>
   )
}

const Wrapper = styled.li`
   ${tw`h-20 border flex items-center px-2 rounded`}
   main {
      span {
         ${tw`block h-4 w-40 mb-1 bg-gray-200 rounded-full`}
         :last-child {
            ${tw`w-24`}
         }
      }
   }
`
