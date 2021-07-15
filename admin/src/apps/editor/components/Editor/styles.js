import styled, { css } from 'styled-components'

export const EditorWrapper = styled.div(
   ({ isHistoryVisible }) => css`
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      grid-template-rows: 48px 1fr;
      grid-template-areas: ${isHistoryVisible
         ? `'head head head head' 'main main main aside'`
         : `'head head head head' 'main main main main'`};
      & > section {
         grid-area: main;
      }
   `
)
