import React from 'react'
import { TooltipContainer } from './styles'
import { HelpCircle } from '../Icons'
import { theme } from '../../theme'
export default function CustomTooltip({
   iconColor = theme.colors.textColor7,
   color = theme.colors.textColor4,
   trigger = 'click',
   iconSize = '24',
   ...props
}) {
   return (
      <TooltipContainer
         trigger={trigger}
         color={color}
         overlayInnerStyle={{
            textAlign: 'center',
            borderRadius: '8px',
            padding: '2rem',
            color: theme.colors.textColor5,
            fontFamily: 'Barlow Condensed',
            fontWeight: '500',
            background: '#ddd !important'
         }}
         {...props}
      >
         <span>
            <HelpCircle size={iconSize} color={iconColor} />
         </span>
      </TooltipContainer>
   )
}
