import styled from 'styled-components'

export const StyleContainer = styled.div`
   background: #ffffff;
   border: 1px solid #ececec;
   box-sizing: border-box;
   display: flex;
   flex-direction: column;
   margin: 0 16px 16px 0;
   padding: 0 16px;
`
export const StyledHeading = styled.div`
   padding: 8px 0;
   display: flex;
   flex-direction: row;
   justify-content: space-between;
`
export const StyledDiv = styled.div`
   display: ${props => (props.col ? 'block' : 'flex')};
   flex-direction: row;
   justify-content: space-between;
   margin-bottom: 4px;
   span {
      font-size: 16px;
   }
`

export const Label = styled.span`
   background: #fecaca;
   color: #ef4444;
   padding: 2px;
`
