import React from 'react'
import { TooltipContainer } from './styles'
import { HelpCircle } from '../Icons'
import { theme } from '../../theme'
export default function CustomTooltip({
   iconColor = theme.colors.textColor7,
   color = theme.colors.textColor5,
   trigger = 'click',
   iconSize = '24',
   ...props
}) {
   return (
      <TooltipContainer trigger={trigger} color={color} {...props}>
         <span>
            <HelpCircle size={iconSize} color={iconColor} />
         </span>
      </TooltipContainer>
   )
}
