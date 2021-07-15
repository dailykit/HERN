import styled from 'styled-components'

export const TunnelHeader = styled.div`
   height: 76px;
   display: flex;
   justify-content: space-between;
   align-items: center;
   padding: 0 16px;
`

export const TunnelBody = styled.div`
   padding: 32px;
   height: calc(100% - 106px);
   overflow: auto;
`

export const StyledRow = styled.div`
   margin-bottom: 32px;
`

export const SolidTile = styled.button`
   width: 70%;
   display: block;
   margin: 0 auto;
   border: 1px solid #cecece;
   padding: 10px 20px;
   border-radius: 2px;
   background-color: #fff;

   &:hover {
      background-color: #f3f3f3;
      cursor: pointer;
   }
`

export const StyledInputWrapper = styled.div`
   width: ${props => props.width}px;
   display: flex;
   align-items: center;
`

export const Spacer = styled.div`
   height: 16px;
`

export const FlexContainer = styled.div`
   display: flex;
`

export const Flexible = styled.div`
   flex: ${({ width }) => width};
`
