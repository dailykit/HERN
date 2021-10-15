import React from 'react'
import { ErrorDiv } from './styles'
import { ErrorIcon } from '../Icons'
import { theme } from '../../theme'

const Error = ({ children, ...props }) => {
   return (
      <ErrorDiv {...props}>
         <span className="error_icon_span">
            <ErrorIcon size={theme.sizes.h8} color={theme.colors.textColor} />
         </span>
         <p className="error_msg">{children}</p>
      </ErrorDiv>
   )
}
export default Error
