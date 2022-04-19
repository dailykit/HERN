import styled from 'styled-components'

export const TunnelBody = styled.div`
   padding: 16px;
   height: calc(100% - 106px);
   overflow: auto;
`
export const ContainerCard = styled.div`
   display: flex;
   border: 2px solid rgb(255, 255, 255);
   box-shadow: rgb(0 0 0 / 10%) 0px 1px 8px;
   padding: 16px;
   margin: 16px 0px;
   flex-direction: column;
`
export const RadioGroupOption = styled.div`
   display: flex;
   align-items: center;
   justify-content: flex-start;
   column-gap: 3em;
   cursor: pointer;
`
export const RadioButton = styled.div`
   display: block;
   padding: 1em;
   border: 1px solid #f3f3f3;
   box-sizing: border-box;
   border-radius: 4px;
   letter-spacing: 1px;
   line-height: 1;
   background: ${props => (props.active === true ? '#F3F3F3' : '#ffffff')};
   span {
      font-family: Roboto;
      font-style: normal;
      font-weight: bold;
      font-size: 14px;
      line-height: 16px;
      /* identical to box height, or 114% */

      text-align: center;
      text-transform: uppercase;
      color: ${props => (props.active === true ? '#367BF5' : '#919699')};
   }
`
