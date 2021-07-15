import styled, { css } from 'styled-components'

export const Parent = styled.ul`
   height: auto;
   margin-bottom: 4px;
`

export const Node = styled.ul(
   ({ theme, isOpen }) => css`
      display: flex;
      align-items: center;
      margin-right: 4px;
      width: 100%;
      justify-content: unset;
      height: ${theme.basePt * 4}px;
      border-radius: 0 50px 50px 0;
      cursor: pointer;
      font-size: ${theme.basePt * 1.75}px;
      padding: 0 ${theme.basePt * 2}px;
      background: transparent;
      color: ${isOpen ? '#555b6e' : '#555b6e'};
      /* border-right: ${isOpen
         ? '4px solid #69A1F6'
         : '4px solid transparent'}; */
      &:hover {
         background: #f1f3f4;
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

export const Children = styled.li(
   ({ theme }) => css`
      list-style: none;
      padding-left: ${theme.basePt * 2}px;
   `
)
