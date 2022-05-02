import React from 'react'
import Link from 'next/link'
import { getRoute } from '../../utils'

export const PageNotFound = () => {
   return (
      <div className="hern-404">
         <h3 className="hern-404-heading">Oops!</h3>
         <p className="hern-404-description">
            We can't find the page that you are looking for..
         </p>
         <span className="hern-404-home-link">
            <Link href={getRoute('/')}>Go to Home</Link>
         </span>
      </div>
   )
}
