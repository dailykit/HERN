import React from 'react'

const KioskButton = props => {
   const { children, onClick, customClass = '', style } = props
   return (
      <button
         className={`hern-kiosk__kiosk-button ${customClass}`}
         onClick={onClick}
         style={style}
      >
         {children}
      </button>
   )
}
export default KioskButton
