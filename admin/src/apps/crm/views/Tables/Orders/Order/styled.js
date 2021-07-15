import styled from 'styled-components'

export const StyledWrapper = styled.div`
   max-width: 1280px;
   width: calc(100vw-64px);
   margin: 0 auto;
   background: #ffffff;
`
export const StyledContainer = styled.div`
   display: flex;
   flex-direction: row;
   align-items: center;
`
export const StyledDiv = styled.div`
   display: grid;
   grid-template-columns: 1fr 1fr 1fr;
`
export const StyledTable = styled.div`
   background: #ffffff;
   border-top: 1px solid #ececec;
`
export const StyledSideBar = styled.div`
   width: 30%;
`
export const StyledMainBar = styled.div`
   width: 70%;
   display: flex;
   flex-direction: column;
   margin-right: 16px;
`

export const SideCard = styled.div`
   background: rgba(243, 243, 243, 0.4);
   border: 1px solid #ececec;
   box-sizing: border-box;
   padding: 16px;
`
export const Card = styled.div`
   padding: 16px;
`
export const CardInfo = styled.div`
   padding: 8px;
   background: ${props => props.bgColor || '#ffffff'};
   display: flex;
   flex-direction: row;
   justify-content: space-between;
`

export const StyledInput = styled.input`
   color: #00a7e1;
   cursor: pointer;
   border: none;
   background: none;
   font-size: inherit;
   &:hover {
      text-decoration: underline;
   }
`
export const StyledSpan = styled.span`
   padding: 0 30px 16px 6px;
   border-right: 1px solid #ececec;
`
export const SmallText = styled.small`
   color: #00a7e1;
   font-size: 14px;
   cursor: pointer;
   &:hover {
      text-decoration: underline;
   }
`

export const Heading = styled(StyledContainer)`
   justify-content: space-between;
   margin: 0 0 0 6px;
   align-items: center;
`
