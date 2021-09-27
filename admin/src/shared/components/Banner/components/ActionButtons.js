import { IconButton, RoundedCloseIcon } from '@dailykit/ui'
import React from 'react'
import { MaximizeIcon, MinimizeIcon } from '../../../assets/icons'
import { StyledActions } from '../styles'

const ActionButtons = ({ isMinimized, setIsMinimized }) => {
   return (
      <StyledActions>
         <h4 style={{ color: '#919699' }}>
            {!isMinimized ? 'Show note' : 'Hide note'}
         </h4>
         <IconButton
            type="ghost"
            size="sm"
            onClick={() => setIsMinimized(!isMinimized)}
         >
            {!isMinimized ? <MinimizeIcon /> : <MaximizeIcon />}
         </IconButton>
         {/* <IconButton onClick={() => {}} type="ghost" size="sm">
            <RoundedCloseIcon color="#367BF5" />
         </IconButton> */}
      </StyledActions>
   )
}
export default ActionButtons
