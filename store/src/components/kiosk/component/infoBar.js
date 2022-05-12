import React from 'react'
import { useConfig } from '../../../lib'
import { useTranslation } from '../../../context'

export const InfoBar = () => {
   const { isStoreAvailable } = useConfig()
   const { t } = useTranslation()
   if (!isStoreAvailable) {
      return (
         <div className="hern-kiosk__info-bar">
            <span className="hern-kiosk__info-bar-message">
               {t(
                  'Not accepting orders right now. Feel free to browse the menu.'
               )}
            </span>
         </div>
      )
   }
   return null
}
