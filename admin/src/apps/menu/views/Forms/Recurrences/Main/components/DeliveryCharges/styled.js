import styled from 'styled-components'

export const StyledHead = styled.div`
   padding: 0.5em;
   display: flex;
   align-items: center;
   justify-content: space-between;
`
export const StyledHeadText = styled.div`
   font-family: Roboto;
   font-style: normal;
   font-weight: 500;
   font-size: 22px;
   line-height: 20px;
   letter-spacing: 0.32px;
   color: #919699;
`
export const StyledHeadAction = styled.div`
   position: relative;
   display: flex;
`
export const StyledContent = styled.div`
   display: grid;
   background: #f9f9f9;
   grid-template-columns: 19rem 16rem 7rem;
   align-items: center;
   width: 100%;
   margin: 0.5em;
   padding: 0.5em 0.5em;
   border-radius: 8px;
`
export const StyledContentText = styled.div`
   display: flex;
   font-family: Roboto;
   font-style: normal;
   font-weight: 500;
   font-size: 17px;
   line-height: 14px;
   padding-left: 10px;
   align-items: center;
   > div:nth-child(1) {
      color: #919699;
   }
   > div:nth-child(2) {
      color: #555b6e;
      padding: 8px;
   }
`
