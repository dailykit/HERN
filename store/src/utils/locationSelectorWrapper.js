import React from 'react'
import { Tunnel } from '../components'
import { LocationSelector } from '../components/locationSelector/index'
import { useTranslation } from '../context'

export const LocationSelectorWrapper = props => {
   const { showLocationSelectorPopup, setShowLocationSelectionPopup } = props
   const { t } = useTranslation()
   return (
      <Tunnel.Left
         title={<span>{t('Location')}</span>}
         visible={showLocationSelectorPopup}
         onClose={() => {
            setShowLocationSelectionPopup(false)
            sessionStorage.setItem('showLocationSelectorAfterPageLoad', 'false')
         }}
         destroyOnClose={true}
      >
         <LocationSelector {...props} />
      </Tunnel.Left>
   )
}
