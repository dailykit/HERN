import styled from 'styled-components'
import { theme } from '../../theme'

export const ErrorDiv = styled.div`
   display: flex;
   margin-top: 4px;
   align-items: center;
   justify-content: flex-start;
   margin: ${({ margin }) => margin};
   .error_icon_span {
      height: 20px;
      width: 20px;
      display: flex;
      margin-right: 4px;
      align-items: center;
      justify-content: center;
   }
   .error_msg {
      color: ${theme.colors.textColor};
      font-size: ${theme.sizes.h7};
      margin: 0 !important;
   }
`
