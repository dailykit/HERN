import styled from 'styled-components'

export const CategoryWrapper = styled.div`
   margin: 16px;
   box-shadow: 0px 0px 5px 1px #ececec;
   padding: 16px;
   position: relative;
   border-radius: 2px;
`

export const OptionWrapper = styled.div`
   margin: 8px;
   border: 1px solid #ececec;
   padding: 8px;
   position: relative;
   border-radius: 2px;
`

export const Action = styled.div`
   position: absolute;
   top: 4px;
   right: 4px;
   cursor: pointer;
   z-index: 10;
`

export const OptionTop = styled.div`
   display: grid;
   grid-gap: 16px;
   grid-template-columns: 80px 1fr;
   margin-bottom: 12px;

   img {
      width: 80px;
      height: 80px;
      object-fit: cover;
   }

   small {
      color: #888d9d;
   }

   > div {
      display: grid;
      grid-template-row: repeat(2, 1fr);
   }
`

export const OptionBottom = styled.div`
   display: grid;
   grid-gap: 16px;
   grid-template-columns: 80px repeat(3, 1fr);
`

export const ImageContainer = styled.div`
   position: relative;
   border-radius: 2px;
`
