import React from 'react'
import { CSSTransition } from 'react-transition-group'
import { LocationSelector } from '../components'

export const LocationSelectorWrapper = props => {
   const { showLocationSelectorPopup } = props
   return (
      <CSSTransition
         in={showLocationSelectorPopup}
         timeout={300}
         unmountOnExit
         classNames="hern-store-location-selector__css-transition"
      >
         <LocationSelector {...props} />
      </CSSTransition>
   )
}
