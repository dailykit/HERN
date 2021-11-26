import React from 'react'

const KioskButton = props => {
   const { children, onClick, customClass = '' } = props
   return (
      <button
         className={`hern-kiosk__kiosk-button ${customClass}`}
         onClick={onClick}
      >
         {children}
      </button>
   )
}
export default KioskButton
