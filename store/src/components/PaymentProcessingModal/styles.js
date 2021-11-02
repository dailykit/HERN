import styled from 'styled-components'
import { theme } from '../../theme'

export const Wrapper = styled.div`
   .action_url {
      display: block;
      text-decoration: underline;
   }
   .ant-result {
      padding: 0 2rem;
   }
   .ant-result-success .ant-result-icon > .anticon {
      color: ${theme.colors.secondaryColor};
   }
   .ant-spin .ant-spin-dot {
      width: 1em;
      height: 1em;
      .ant-spin-dot-item {
         background-color: ${theme.colors.textColor};
         width: 1rem;
         height: 1rem;
      }
   }
`
