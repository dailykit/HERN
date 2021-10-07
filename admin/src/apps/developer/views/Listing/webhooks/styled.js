import styled from 'styled-components'

export const Wrapper = styled.div`
   width: 100%;
   padding: 12px;
   background: #e3e3e3;
   height: calc(100vh - 40px);
   > div {
      height: 100%;
      display: grid;
      grid-gap: 12px;
      grid-template-columns: 1fr 1fr;
      > aside,
      > main {
         background: #fff;
         border-radius: 2px;
         overflow-y: auto;
      }
   }
`