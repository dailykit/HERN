import styled, { css } from 'styled-components'

export const StyledHeader = styled.header`
   background: #fff;
   display: flex;
   align-items: center;
   justify-content: space-between;
   border: 1px solid #e0c9c9;
   border-bottom: 0;
`

export const StyledMenu = styled.div`
   width: 40px;
   height: 40px;
   display: flex;
   cursor: pointer;
   align-items: center;
   justify-content: center;
   :hover {
      background: #f2f2f2;
   }
`

export const EditorOptionsWrapper = styled.div(
   ({ theme }) => css`
      display: flex;
      height: ${theme.basePt * 6}px;
      align-items: center;
      justify-content: space-between;
      border-bottom: 1px solid ${theme.border.color};
      padding: 0 ${theme.basePt}px;
      grid-area: head;
      font-family: Roboto;
      font-style: normal;
      font-weight: bold;
      font-size: 14px;
      line-height: 16px;
      .save {
         color: #00a7e1;
         cursor: pointer;
         &:hover {
            text-decoration: underline;
         }
      }
      .preview {
         color: #555b6e;
         cursor: pointer;
      }
   `
)
