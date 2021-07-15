import styled from 'styled-components'

export const Container = styled.div`
   max-width: 1280px;
   margin: 0 auto;
`

export const InputWrapper = styled.div`
   max-width: 256px;
`

export const ActionsWrapper = styled.div`
   display: flex;
   justify-content: space-between;
`

export const StyledMain = styled.div`
   background: #f3f3f3;
`

export const StyledTop = styled.div`
   display: grid;
   grid-template-columns: 20% 80%;
   grid-gap: 40px;
   height: 192px;
   align-items: center;
`

export const StyledStatsContainer = styled.div`
   height: 128px;
   display: flex;
   align-items: flex-end;
`
export const StyledStat = styled.div`
   padding-right: 40px;
   margin-right: 12px;
   color: #555b6e;
   font-weight: 500;
   &:not(:last-child) {
      border-right: 1px solid #dddddd;
   }
   h2 {
      font-size: 20px;
      line-height: 23px;
   }
   p {
      font-size: 14px;
      line-height: 16px;
   }
`

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
      object-fit: auto;
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

export const StyledInfo = styled.div`
   display: flex;
   align-items: center;
   h1 {
      font-weight: 500;
      font-size: 24px;
      line-height: 28px;
      color: #555b6e;
   }
   span {
      font-weight: 500;
      font-size: 14px;
      line-height: 16px;
      color: #888d9d;
   }
`

export const StyledSupplier = styled.div`
   display: flex;
   align-items: center;
   span {
      padding: 0 16px;
      font-size: 14px;
      line-height: 16px;
      color: #888d9d;

      &:first-child {
         margin-right: 12px;
         padding: 0 4px;
         font-weight: 500;
         color: #00a7e1;
         border-right: 1px solid #e4e4e4;
      }
   }
`

export const StyledGrid = styled.div`
   width: 100%;
   display: grid;
   padding: 0 20px;
   grid-template-columns: repeat(3, 1fr);
   height: 96px;
   border-bottom: 1px solid #dddddd;
   border-top: 1px solid #dddddd;

   &:hover {
      background-color: #ededed;
      cursor: pointer;
   }

   > div {
      &:not(:last-child) {
         border-right: 1px solid #dddddd;
      }

      display: flex;
      align-items: center;
      padding: 12px;

      > div {
         &:last-child {
            flex: 1;
            padding: 8px;
            display: flex;
            flex-direction: column;

            div {
               font-weight: 500;
               line-height: 23px;
               color: #555b6e;
               display: flex;
            }
         }
      }
   }
   @media screen and (max-width: 568px) {
      grid-template-columns: auto;
      height: auto;
   }
`

export const ProcessingButton = styled.div`
   margin-top: 14px;
   width: 90%;
   display: flex;
   padding: 10px;
   background-color: ${props => (props.active ? '#555b6e' : '#e5e5e5')};
   color: ${props => (props.active ? '#fff' : '#555b6e')};

   &:hover {
      cursor: pointer;
   }
`

export const TransparentIconButton = styled.button`
   height: 20px;
   width: 20px;
   background: transparent;
   border: 0;
   outline: none;
   cursor: pointer;
`

export const TabContainer = styled.div`
   display: flex;
   border-bottom: 1px solid rgba(136, 141, 157, 0.3);
   margin: 10px 0;
`

export const ItemTab = styled.div`
   border-bottom: ${({ active }) => (active ? `3px solid #00a7e1` : 0)};
   margin: 0px 15px;
   min-width: 58px;
   text-align: center;
   cursor: pointer;
`
export const ReceivedFromSupplier = styled.div`
   min-width: fit-content;
`
export const MiseInPlaceWrapper = styled.div`
   min-width: fit-content;
`
export const MiseInPlaceItems = styled.div`
   @media screen and (max-width: 767px) {
      display: flex;
      overflow-x: auto;
   }
`
