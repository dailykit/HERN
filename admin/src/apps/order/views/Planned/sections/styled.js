import styled, { css } from 'styled-components'

export const Products = styled.ul`
   margin-bottom: 16px;
   li {
      list-style: none;
   }
   > li + li {
      margin-top: 16px;
   }
`

export const Product = styled.li`
   padding: 16px;
   border: 1px solid #e1e1e1;
   border-radius: 2px;
   h3 {
      width: 180px;
      font-size: 16px;
      font-weight: 400;
   }
`

export const ProductOptions = styled.ul`
   overflow-y: auto;
   max-height: 192px;
`

export const ProductOption = styled.li(
   ({ status }) => css`
      height: 40px;
      display: flex;
      padding: 0 12px;
      align-items: center;
      background: #f3f3f3;
      border-radius: 2px;
      background: ${status === 'PACKED' ? '#79df54' : '#f9daa8'};
      + li {
         margin-top: 4px;
      }
      span {
         width: 280px;
         font-size: 14px;
         font-weight: 400;
      }
   `
)

export const ProductTitle = styled.h2(
   ({ isLink }) => css`
      width: 280px;
      font-size: 16px;
      font-weight: 500;
      margin-right: 16px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      ${isLink && 'cursor: pointer'};
   `
)

export const OptionsHeader = styled.section`
   height: 32px;
   display: flex;
   align-items: center;
   span {
      width: 280px;
      font-size: 14px;
      padding: 0 12px;
      color: rgb(136, 141, 157);
   }
`
