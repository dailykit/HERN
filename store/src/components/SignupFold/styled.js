import styled from 'styled-components'
import { theme } from '../../theme'

export const Wrapper = styled.div`
   .signupFold_heading {
      color: ${theme.colors.textColor};
      font-weight: 400;
      text-align: center;
      margin-bottom: 20px;
      text-transform: uppercase;
      font-family: League-Gothic;
   }
   .signupFold_para {
      color: ${({ bgMode = 'light' }) =>
         bgMode === 'light'
            ? theme.colors.textColor7
            : theme.colors.textColor4};
      font-weight: 400;
      text-align: center;
      margin-bottom: 4rem;
   }
   .signupFold_signupBtn {
      width: auto;
      margin: 4rem auto 6rem auto;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: 'Maven Pro';
      font-style: normal;
      font-weight: 800;
      color: ${({ bgMode = 'light' }) =>
         bgMode === 'light' ? theme.colors.textColor4 : theme.colors.textColor};
      padding: 24px 64px;
      letter-spacing: 0.16em;
      background: ${({ bgMode = 'light' }) =>
         bgMode === 'light' ? theme.colors.textColor : theme.colors.textColor4};
   }
`
