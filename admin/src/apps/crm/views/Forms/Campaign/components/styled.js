import styled from 'styled-components'

export const StyledContainer = styled.div`
   position: relative;
`

export const StyledRow = styled.div`
   margin-bottom: 16px;
   display: flex;
   flex-direction: row;
   justify-content: space-between;
`

export const StyledAction = styled.div`
   position: absolute;
   right: 16px;
   top: 16px;
`

export const TunnelBody = styled.div`
   padding: 32px;
   height: calc(100% - 106px);
   overflow: auto;
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

export const StyledWrapper = styled.div`
   display: flex;
   flex-direction: row;
   justify-content: space-between;
   padding: 16px;
`

export const ImageContainer = styled.div`
   width: 464px;
   height: 128px;
   position: relative;
   margin-bottom: 16px;
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
export const HorizontalCard = styled.div`
   display: flex;
   flex-direction: row;
   padding: 0 10px 10px 10px;
`

export const StyledCard = styled.div`
   box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2);
   transition: 0.3s;
   width: 40%;
   margin: 0 20em;
   img {
      width: 100%;
   }
   &:hover {
      box-shadow: 0 8px 16px 0 rgba(0, 0, 0, 0.2);
   }
`
export const StyledInfo = styled.span`
   display: inline;
`
