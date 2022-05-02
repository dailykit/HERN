import React from 'react'

const KioskButton = props => {
   const {
      children,
      onClick,
      customClass = '',
      style,
      buttonConfig = null,
      disabled = false,
   } = props
   if (buttonConfig.buttonType.value.value == 'GRADIENT') {
      return (
         <button
            className={`hern-kiosk__kiosk-button ${customClass}`}
            onClick={onClick}
            style={style}
            disabled={disabled}
         >
            {children}
         </button>
      )
   }
   return (
      <button
         className={`hern-kiosk__kiosk-button-linear ${customClass}`}
         onClick={onClick}
         style={{
            ...style,
            backgroundColor: disabled
               ? buttonConfig.buttonDisabledColor.value
               : style?.background ||
                 style?.backgroundColor ||
                 buttonConfig.buttonBGColor.value,
            color: style?.color || buttonConfig.textColor.value,
         }}
         disabled={disabled}
      >
         {children}
      </button>
   )
}
export default KioskButton
