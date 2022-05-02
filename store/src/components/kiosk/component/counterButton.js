import { Button } from 'antd'
import React from 'react'
import { MinusIcon, PlusIcon } from '../../../assets/icons'

export const KioskCounterButton = props => {
   const { onPlusClick, onMinusClick, quantity, config, style = {} } = props
   return (
      <div
         className="hern-kiosk__counter-btns"
         style={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            borderRadius: '.5em',
            backgroundColor: `${config.kioskSettings.theme.primaryColorLight.value}`,
            ...style,
         }}
      >
         <span
            className="hern-kiosk__counter-btn"
            style={{ padding: '.5em 1em' }}
         >
            <MinusIcon
               size={30}
               stroke="currentColor"
               color={`${config.kioskSettings.theme.primaryColor.value}`}
               onClick={onMinusClick}
            />
         </span>
         <span
            className="hern-kiosk__counter-qty"
            style={{
               fontSize: '2em',
               fontWeight: '700',
               padding: '0 1em',
               backgroundColor: '#ffffff',
            }}
         >
            {quantity}
         </span>
         <span
            classnames="hern-kiosk__counter-btn"
            style={{ padding: '.5em 1em' }}
         >
            <PlusIcon
               size={30}
               color={`${config.kioskSettings.theme.primaryColor.value}`}
               stroke="currentColor"
               onClick={onPlusClick}
            />
         </span>
      </div>
   )
}
