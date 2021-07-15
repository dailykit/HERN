import styled from 'styled-components'

export const StyledWrapper = styled.div`
   background-color: #fff;
   margin: 0;
   h1 {
      color: #555b6e;
      font-size: 20px;
      font-weight: 500;
      line-height: 23px;
   }
`
export const TunnelBody = styled.div`
   padding: 32px;
   height: calc(100% - 106px);
   overflow: auto;
`

export const InputWrapper = styled.div`
   background-color: #ffffff;
   padding: 32px 32px 0 32px;
`
export const StyledComp = styled.div`
   padding: 32px;
   background-color: #e5e5e5;
   .pageDetails {
      height: max-content;
      width: 100%;
   }
`
export const StyledInsight = styled.div`
   margin-left: 26px;
   padding-left: 16px;
   background: #fff;
   width: 100%;
   height: inherit;
   max-width: 897.2px;
   max-height: 620px;
   overflow: auto;
   box-sizing: border-box;
`

export const StyledDiv = styled.div`
   padding: 0;
   margin: 16px;
   background-color: #ffffff;
   margin-bottom: 4rem;
   height: calc(100vh - 45vh);
   overflow: auto;
`
export const Highlight = styled.p`
   color: #00a7e1;
   cursor: pointer;
   &:hover {
      text-decoration: underline;
   }
`
export const TreeViewWrapper = styled.div`
   height: calc(100vh - 45vh);
   overflow: auto;
`
