import React from 'react'
import Link from 'next/link'
import tw, { styled } from 'twin.macro'

import { getRoute } from '../../utils'

export const PageNotFound = () => {
   return (
      <Wrapper>
         <Heading>Oops!</Heading>
         <Text>We can't find the page that you are looking for..</Text>
         <Link
            href={getRoute('/subscription')}
            tw="mt-4 text-blue-500 border-b border-blue-500"
         >
            Go to Home
         </Link>
      </Wrapper>
   )
}
const Wrapper = styled.div`
   ${tw`flex items-center flex-col pt-24`}
`

const Heading = tw.h1`
  text-2xl text-gray-500 uppercase
`

const Text = tw.p`
  text-xl text-gray-700
`
