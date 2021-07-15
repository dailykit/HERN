import styled from 'styled-components'

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
   width: ${props => (props.width ? props.width : 'auto')};
   height: ${props => (props.height ? props.height : 'auto')};
   max-width: ${props => (props.maxWidth ? props.maxWidth + 'px' : '100%')};
   position: ${props => props.position || 'relative'};
   background: ${props => props.bg || 'transparent'};
`

export const Flex = styled.div`
   display: flex;
   flex-direction: ${props => props.direction || 'column'};
   justify-content: ${props => props.justify || 'space-between'};
   align-items: ${props => props.align || 'flex-start'};
`
