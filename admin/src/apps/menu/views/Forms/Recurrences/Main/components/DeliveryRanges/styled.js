import styled from 'styled-components'

export const StyledHeading = styled.div`
   width: 26em;
   padding: 0.5em;
   display: flex;
   align-items: center;
   justify-content: space-between;
`
export const StyledHeadingText = styled.div`
   font-family: Roboto;
   font-style: normal;
   font-weight: 500;
   font-size: 22px;
   line-height: 20px;
   letter-spacing: 0.32px;
   color: #919699;
`
export const StyledHeadingAction = styled.div`
   position: relative;
   display: flex;
   right: 2em;
`
export const StyledContext = styled.div`
   display: flex;
   font-family: Roboto;
   font-style: normal;
   font-weight: 500;
   font-size: 15px;
   line-height: 18px;
   padding: 0.2em;
   > div:nth-child(1) {
      color: #919699;
      width: 7em;
      text-align: left;
   }
   > div:nth-child(2) {
      color: #555b6e;
   }
`
export const StyledCardAction = styled.div`
   display: flex;
   flex-direction: row;
   align-items: center;
   position: absolute;
   right: 0;
   height: 2em;
`
