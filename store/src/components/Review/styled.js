import styled from 'styled-components'
import { theme } from '../../theme'

export const Wrapper = styled.div`
   padding: 0 2rem;
   height: 296px;
   max-width: 350px;
   background: ${theme.colors.lightBackground.grey};
   border-radius: 40px;
   display: flex;
   flex-direction: column;
   align-items: center;
   justify-content: center;
   @media (min-width: 769px) {
      max-width: 100%;
      padding: 0 4rem;
   }
`

export const StyledContent = styled.p`
   color: ${theme.colors.textColor7};
   font-family: Futura;
   font-style: normal;
   font-weight: 500;
   font-size: 20px;
   line-height: 30px;
   display: flex;
   align-items: center;
   text-align: center;
   margin-bottom: 0;
`

export const StyledFooter = styled.div`
   color: ${theme.colors.textColor5};
   font-family: Proxima Nova;
   font-style: normal;
   font-weight: bold;
   font-size: 13px;
   line-height: 13px;
   text-align: center;
   letter-spacing: 0.3em;
   margin-top: 1rem;
`
