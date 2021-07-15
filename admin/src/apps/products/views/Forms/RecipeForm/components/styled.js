import styled from 'styled-components'

export const Container = styled.div`
   margin-top: ${props => props.top || 0}px;
   margin-bottom: ${props => props.bottom || 0}px;
   margin-left: ${props => props.left || 0}px;
   margin-right: ${props => props.right || 0}px;
   padding-left: ${props => props.paddingX || 0}px;
   padding-right: ${props => props.paddingX || 0}px;
   padding-top: ${props => props.paddingY || 0}px;
   padding-bottom: ${props => props.paddingY || 0}px;
   width: ${props => props.width || null};
   position: relative;
`

export const ContainerAction = styled.span`
   position: absolute;
   right: 0;
   top: 32px;
   cursor: pointer;
   z-index: 1;
`

export const Flex = styled.div`
   display: flex;
   flex-direction: ${props => props.direction || 'row'};
   justify-content: ${props => props.justify || 'space-between'};
   align-items: ${props => props.align || 'flex-start'};
`

export const Grid = styled.div`
   display: grid;
   grid-template-columns: repeat(${props => props.cols || 2}, 1fr);
   grid-gap: ${props => props.gap || 8}px;
`
