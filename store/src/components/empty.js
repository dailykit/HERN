import React from 'react'
import { useRouter } from 'next/router'
import { EmptyCloche, EmptyStore } from '../assets/icons'
import { Button } from './button'
import { getRoute } from '../utils'

export const Empty = props => {
   const {
      title,
      description,
      route,
      buttonLabel,
      illustration = 'empty-cloche',
   } = props
   const router = useRouter()
   return (
      <div className="hern-empty">
         {illustration === 'empty-store' ? <EmptyStore /> : <EmptyCloche />}
         {title && <h3>{title}</h3>}
         {description && <p>{description}</p>}
         {route && (
            <Button onClick={() => router.push(getRoute(route))}>
               {buttonLabel}
            </Button>
         )}
      </div>
   )
}
