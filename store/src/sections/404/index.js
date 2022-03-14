import React from 'react'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { getRoute } from '../../utils'

export const PageNotFound = () => {
   return (
      <div className="hern-404">
         <h3 className="hern-404-heading">Oops!</h3>
         <p className="hern-404-description">
            We can't find the page that you are looking for..
            <button
               onClick={async () => {
                  const camelCaseToNormalText = await import(
                     '../../utils/camelCaseToNormalText'
                  )
                  console.log(camelCaseToNormalText)
                  console.log(camelCaseToNormalText('IamALowerCaseText'))
               }}
            >
               Here is a button
            </button>
            {/* {camelCaseToNormalText('amaroPoranoJahaChay')} */}
         </p>
         <span className="hern-404-home-link">
            <Link href={getRoute('/')}>Go to Home</Link>
         </span>
      </div>
   )
}
