import styled from 'styled-components'
import { theme } from '../../theme'
import { Modal } from 'antd'

export const ModalContainer = styled(Modal)`
   .actionBtn {
      width: auto;
      padding: 0 1rem;
      height: 40px;
      border-radius: 8px;
      background: ${theme.colors.textColor};
      color: ${theme.colors.textColor4};
   }
`

export const StyledTitle = styled.h1`
   font-weight: 400;
   color: ${theme.colors.textColor};
   font-family: 'Barlow Condensed';
   font-size: 38px;
   margin: 0;
`
