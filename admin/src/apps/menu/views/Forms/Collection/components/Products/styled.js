import styled from 'styled-components'

export const StyledCategoryWrapper = styled.div`
   margin: 8px;
   width: 400px;
`

export const StyledHeader = styled.div`
   display: flex;
   justify-content: space-between;
   align-items: center;
`
export const StyledProductWrapper = styled.div`
   border: 1px solid #efefef;
   height: 76px;
   display: flex;
   align-items: center;
   justify-content: space-between;
   padding: 0 8px;
   margin-bottom: 8px;
`

export const ProductContent = styled.div`
   display: flex;
   align-items: center;
`

export const ProductImage = styled.img`
   width: 60px;
   height: 60px;
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
