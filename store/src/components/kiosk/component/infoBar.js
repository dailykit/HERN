import React from 'react'
import { useConfig } from '../../../lib'
import { useTranslation } from '../../../context'

export const InfoBar = ({ message, backgroundColor }) => {
   const { isStoreAvailable } = useConfig()
   const { t } = useTranslation()
   if (!isStoreAvailable) {
      return (
         <div style={{ backgroundColor }} className="hern-kiosk__info-bar">
            <span className="hern-kiosk__info-bar-message">{t(message)}</span>
         </div>
      )
   }
   return null
}
