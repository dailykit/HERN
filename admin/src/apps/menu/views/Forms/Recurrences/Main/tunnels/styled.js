import styled from 'styled-components'

export const TunnelBody = styled.div`
   padding: 16px;
   height: calc(100% - 106px);
   overflow: auto;
`

export const StyledRow = styled.div`
   margin-bottom: 32px;
`
export const InputsNotes = styled.p`
   font-family: roboto;
   font-style: italic;
   font-weight: normal;
   font-size: 12px;
   line-height: 14px;
   color: #919699;
`
export const InputHeading = styled.p`
   font-family: roboto;
   font-style: normal;
   font-weight: 500;
   font-size: 14px;
   line-height: 20px;
   cursor: default;
   color: #919699;
   letter-spacing: 0.3px;
`
export const StyledGeoBoundary = styled.div`
   display: flex;
   justify-content: space-around;
   align-items: flex-end;
`
export const RecurrenceDays = styled.div`
   display: flex;
   align-items: center;
   justify-content: flex-start;
   column-gap: 3em;
   cursor: pointer;
`
export const DaysButton = styled.div`
   display: block;
   padding: 1em;
   border: 1px solid #f3f3f3;
   box-sizing: border-box;
   border-radius: 4px;
   letter-spacing: 1px;
   line-height: 1;
   background: ${props => (props.value === true ? '#F3F3F3' : '#ffffff')};
   span {
      font-family: Roboto;
      font-style: normal;
      font-weight: bold;
      font-size: 14px;
      line-height: 16px;
      /* identical to box height, or 114% */

      text-align: center;
      text-transform: uppercase;
      color: ${props => (props.value === true ? '#367BF5' : '#919699')};
   }
`
export const TimeButton = styled.div`
   display: block;
   padding: 0.5em;
   border: 1px solid #f3f3f3;
   box-sizing: border-box;
   border-radius: 4px;
   letter-spacing: 0.5px;
   line-height: 1;
   background: ${props => (props.value === true ? '#F3F3F3' : '#ffffff')};
   span {
      font-family: Roboto;
      font-style: normal;
      font-size: 11px;
      line-height: 18px;
      text-align: center;
      text-transform: uppercase;
      color: ${props => (props.value === true ? '#367BF5' : '#919699')};
   }
`
