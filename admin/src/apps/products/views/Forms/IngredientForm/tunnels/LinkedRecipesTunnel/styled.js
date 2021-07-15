import styled from 'styled-components'

export const StyledProductWrapper = styled.div`
   border: 1px solid #efefef;
   height: 64px;
   display: flex;
   align-items: center;
   justify-content: space-between;
   padding: 0 8px;
   cursor: pointer;
   margin-bottom: 16px;
   position: relative;

   span {
      display: none;
      position: absolute;
      top: 8px;
      right: 8px;
   }

   &:hover {
      background: #efefef;

      span {
         display: inline;
      }
   }
`

export const ProductContent = styled.div`
   display: flex;
   align-items: center;
`

export const ProductImage = styled.img`
   width: 56px;
   height: 56px;
   border-radius: 4px;
   object-fit: cover;
   margin-right: 8px;
`

export const Grid = styled.div`
   display: grid;
   grid-gap: 16px;
   grid-template-columns: repeat(3, 1fr);
`

export const ActionButton = styled.button`
   background: transparent;
   border: none;
   cursor: pointer;
`
