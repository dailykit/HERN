import styled from 'styled-components'

export const StyledWrapper = styled.div`
   margin: 0 auto;

   h1 {
      color: #555b6e;
      font-size: 20px;
      font-weight: 500;
      line-height: 23px;
   }
`

export const StyledHeader = styled.div`
   height: 80px;
   display: flex;
   align-items: center;
   justify-content: space-between;
   border-bottom: 1px solid #d8d8d8;
   padding: 0 32px;
`

export const MasterSettings = styled.div`
   display: flex;
   align-items: center;

   svg {
      margin-right: 8px;
   }
`

export const StyledBody = styled.div`
   padding: 32px;
`

export const Grid = styled.div`
   display: grid;
   grid-template-columns: repeat(${props => props.cols || 2}, 1fr);
   grid-gap: ${props => props.gap || 8}px;
`

export const Container = styled.div`
   margin-top: ${props => props.top || 0}px;
   margin-bottom: ${props => props.bottom || 0}px;
   margin-left: ${props => props.left || 0}px;
   margin-right: ${props => props.right || 0}px;
   padding-left: ${props => props.paddingX || 0}px;
   padding-right: ${props => props.paddingX || 0}px;
   padding-top: ${props => props.paddingY || 0}px;
   padding-bottom: ${props => props.paddingY || 0}px;
   position: relative;
`

export const Flex = styled.div`
   display: flex;
   direction: ${props => props.direction || 'column'};
   justify-content: ${props => props.justify || 'space-between'};
   align-items: ${props => props.align || 'flex-start'};
`
