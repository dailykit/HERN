import styled, { css } from 'styled-components'

import { Modal } from '../../../../components'

export const StyledModal = styled(Modal)(
   ({ theme }) => css`
      header {
         display: grid;
         grid-template-columns: 1fr ${theme.basePt * 10}px;
         grid-column-gap: ${theme.basePt}px;
         input,
         button {
            height: ${theme.basePt * 10}px;
         }
         input {
            padding-left: ${theme.basePt}px;
         }
      }
   `
)

export const StyledFileSection = styled.section(
   ({ theme }) => css`
      height: auto;
      border-bottom: 1px solid ${theme.border.color};
      padding: ${theme.basePt * 2}px 0;
      h2 {
         font-size: ${theme.basePt * 2.5}px;
         padding-bottom: ${theme.basePt * 2}px;
      }
      div {
         height: ${theme.basePt * 5}px;
         padding: 0 ${theme.basePt}px;
         display: flex;
         align-items: center;
         justify-content: space-between;
         margin-bottom: ${theme.basePt}px;
         border: 1px solid ${theme.border.color};
         border-radius: ${theme.basePt / 2}px;
         &:hover button {
            visibility: visible;
         }
         button {
            height: ${theme.basePt * 3}px;
            border: none;
            color: #fff;
            cursor: pointer;
            background: grey;
            visibility: hidden;
            border-radius: ${theme.basePt / 2}px;
         }
      }
   `
)
