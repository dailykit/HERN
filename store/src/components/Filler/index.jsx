import React from 'react'
import { Filler } from './styles'
import Link from 'next/link'
import { EmptyState } from '../../../public/assets/illustrations'
export default function FillerComp({
   message,
   illustration,
   width,
   height,
   linkUrl,
   linkText,
   textStyle,
   ...rest
}) {
   return (
      <Filler {...rest}>
         {illustration || (
            <EmptyState width={width || '100%'} height={width || '50vh'} />
            // <EmptyState width="400px" height="400px" />
         )}
         {message && <h1 className={`message ${textStyle}`}>{message}</h1>}

         {linkUrl && (
            <Link href="/experiences">
               <a className="linkToExperiences"> {linkText}</a>
            </Link>
         )}
      </Filler>
   )
}
