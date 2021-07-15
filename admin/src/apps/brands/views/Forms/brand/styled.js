import styled from 'styled-components'

export const Wrapper = styled.div`
   padding-top: 16px;
   [data-reach-tab-list] {
      padding: 0 16px;
   }
   [data-reach-tab-panel] {
      padding: 0;
      height: calc(100vh - 154px);
   }
`

export const Label = styled.label`
   color: #6f6565;
   font-size: 13px;
   font-weight: 500;
   letter-spacing: 0.6px;
   text-transform: uppercase;
`
