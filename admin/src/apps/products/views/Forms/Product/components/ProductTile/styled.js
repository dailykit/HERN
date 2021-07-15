import styled from 'styled-components'

export const Action = styled.span`
   position: absolute;
   top: 8px;
   right: 8px;
`

export const ProductImage = styled.img`
   height: ${props => props.size || '32px'};
   width: ${props => props.size || '32px'};
   object-fit: cover;
   border-radius: 2px;
`

export const Wrapper = styled.div`
   display: flex;
   align-items: center;
   height: 60px;
   padding: 8px;
   position: relative;
`
