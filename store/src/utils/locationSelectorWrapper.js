import React from 'react'
import { CSSTransition } from 'react-transition-group'
import { Tunnel } from '../components'
import { LocationSelector } from '../components/locationSelector/index'

export const LocationSelectorWrapper = props => {
   const { showLocationSelectorPopup, setShowLocationSelectionPopup } = props
   return (
      <Tunnel.Left
         title={'Location'}
         visible={showLocationSelectorPopup}
         onClose={() => setShowLocationSelectionPopup(false)}
      >
         <LocationSelector {...props} />
      </Tunnel.Left>
   )
}
