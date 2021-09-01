import React from 'react'
import Link from 'next/link'
import tw, { styled } from 'twin.macro'

import { getRoute } from '../../utils'

export const PageNotFound = () => {
   return (
      <div className="hern-404">
         <h3 className="hern-404-heading">Oops!</h3>
         <p className="hern-404-description">
            We can't find the page that you are looking for..
         </p>
         <span className="hern-404-home-link">
            <Link href={getRoute('/subscription')}>Go to Home</Link>
         </span>
      </div>
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
