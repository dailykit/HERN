import styled, { css } from 'styled-components'

export const PanelWrapper = styled.div`
   width: 100%;
   height: 100vh;
   max-height: 100vh;
   overflow: auto;
   padding-bottom: 16px;
   display: 'block';
`

export const Parent = styled.ul`
   height: auto;
`

export const Node = styled.ul(
   ({ theme, isOpen }) => css`
      display: flex;
      align-items: center;
      justify-content: space-between;
      height: ${theme.basePt * 4}px;
      border-radius: ${theme.basePt / 2}px 0 0 ${theme.basePt / 2}px;
      cursor: pointer;
      font-size: ${theme.basePt * 1.75}px;
      padding: 0 ${theme.basePt * 2}px;
      background: transparent;
      color: ${isOpen ? '#000' : '#9ca2a7'};
      border-right: ${isOpen ? '4px solid #69A1F6' : '4px solid transparent'};
      &:hover {
         background: #f0f0f0;
      }
   `
)

export const Icon = styled.i(
   ({ theme }) => css`
      cursor: pointer;
      height: ${theme.basePt * 2.5}px;
      width: ${theme.basePt * 2.5}px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      &:hover {
         background: #dfdfdf;
      }
   `
)

export const Children = styled.div(
   ({ theme }) => css`
      margin-top: 8px;
      padding: ${theme.basePt * 1.5}px;
      background-color: #f9f9f9;
      max-height: 160px;
      overflow: auto;
   `
)

export const Fold = styled.div`
   padding: 10px;
`
export const Child = styled.div`
   display: flex;
   flex-direction: row;
   align-items: center;
   justify-content: space-between;
   padding: 4px;
   .delete {
      cursor: pointer;
      svg {
         &:hover {
            stroke: #d95e56;
         }
      }
   }

   &:hover {
      background-color: #f2f2f2;
   }
`
