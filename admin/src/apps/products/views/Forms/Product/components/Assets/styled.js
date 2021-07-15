import styled from 'styled-components'

export const PhotoTileWrapper = styled.div`
   width: 464px;
`
export const ImageContainer = styled.div`
   width: 464px;
   height: 128px;
   position: relative;
   img {
      width: 464px;
      height: 128px;
      object-fit: cover;
   }
   div {
      position: absolute;
      padding: 12px;
      right: 0;
      left: 0;
      text-align: right;
      background: linear-gradient(to bottom, #111, transparent);
      span {
         margin-right: 16px;
         cursor: pointer;
      }
   }
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
