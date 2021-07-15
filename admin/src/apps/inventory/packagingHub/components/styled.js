import styled, { css } from 'styled-components'

import { FlexContainer } from '../../views/Forms/styled'

export const CardWrapper = styled.div`
   height: 267px;
   width: 475px;
   border: 1px solid #ececec;
   background: #fff;

   cursor: pointer;
`

export const CardContent = styled.div`
   display: flex;
   justify-content: space-between;
   align-items: center;
   margin-top: 12px;
   margin-left: 12px;
`

export const CardImage = styled.div`
   flex: 1.3;
`

export const CardData = styled.div`
   flex: 2;
   margin-left: 40px;

   h1 {
      font-size: 28px;
      line-height: 27px;
      color: #555b6e;
      margin: 12px 0;
      margin-top: 0;
      padding-right: 8px;
   }
`

export const Lead = styled.p`
   font-weight: 500;
   font-size: 12px;
   line-height: 11px;
`

export const Flexi = styled.div`
   display: flex;
   align-items: flex-end;
   p {
      margin: 0;

      font-size: 16px;
      line-height: 19px;
      color: #555b6e;
   }
   span {
      font-size: 10px;
      line-height: 12px;

      color: #555b6e;
   }
`

export const FlexiSpaced = styled(Flexi)`
   justify-content: space-between;
   width: 60%;
   margin-top: 12px;
`

export const CardPrice = styled.span`
   font-style: italic;
   font-weight: 500;
   font-size: 12px;
   line-height: 14px;
   color: #ff7a4d;
   margin-top: 12px;
`

export const ActionButton = styled.button`
   width: 100%;
   border: 0;
   color: #fff;
   font-size: 14px;
   margin-top: 20px;
   padding: 8px;
   background: linear-gradient(180deg, #28c1f7 -4.17%, #00a7e1 100%);
   cursor: pointer;
`

export const PriceTable = styled.table`
   width: 100%;
   display: table;
   border-collapse: separate;
   border-spacing: 0 2px;
`
export const TableHead = styled.thead`
   width: 100%;
   display: table-header-group;
   td {
      height: 4rem;
      color: #888d9d;
      font-size: 14px;
   }
`
export const TableBody = styled.tbody`
   display: table-row-group;

   tr {
      background: #f3f3f3;
      cursor: pointer;

      &:hover {
         background: #ececec;
      }
   }

   td {
      border-bottom: 1px solid #ececec;
      border-top: 1px solid #ececec;
      height: 48px;
      color: #555b6e;
      font-size: 14px;

      &:first-child {
         border-left: 1px solid #ececec;
      }

      &:last-child {
         border: 0;
         background: #fff;
      }

      &:nth-last-child(2) {
         border-right: 1px solid #ececec;
      }
   }
`
export const TableRow = styled.tr`
   display: table-row;
   background: ${({ isSelected }) => (isSelected ? '#fff !important' : null)};
   box-shadow: ${({ isSelected }) =>
      isSelected ? '2px 4px 14px rgba(0, 0, 0, 0.07)' : null};
`
export const TableCell = styled.td(
   ({ align }) => css`
      padding: 0 12px;
      display: table-cell;
      text-align: ${align === 'right' ? align : 'left'};
      > div {
         float: ${align === 'right' ? align : 'left'};
      }
   `
)

export const MultiplierWrapper = styled(FlexContainer)`
   width: 95%;
   align-items: flex-end;
   justify-content: space-between;
   margin: 0 auto;

   button {
      border: 0;
      cursor: pointer;
      margin-bottom: 4px;
      background: transparent;
   }

   span {
      width: 100%;

      border-bottom: 1px solid #888d9d;
      text-align: center;
      padding-bottom: 4px;
   }
`
