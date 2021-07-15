import styled, { css } from 'styled-components'

export const Wrapper = styled.div(
   ({ height, width }) => css`
      overflow: hidden;
      display: grid;
      ${width && `width: ${width};`}
      grid-template-columns: 240px 1fr;
      aside,
      > main {
         overflow-y: auto;
         height: ${height || '100vh'};
         > div {
            > section {
               > h2 {
                  padding-bottom: 4px;
                  border-bottom: 1px solid #e3e3e3;
               }
            }
         }
      }
   `
)

export const Sidebar = styled.aside`
   padding: 6px;
   border-radius: 2px;
   background: #d9e9f1;
   > ul > li {
      list-style: none;
      margin-bottom: 4px;
   }
   > ul > li > ul {
      margin-left: 16px;
      padding-top: 4px;
      li {
         list-style: none;
         + li {
            margin-top: 4px;
         }
      }
   }
   a {
      height: 32px;
      width: 195px;
      display: flex;
      color: #1f495e;
      padding: 0 8px;
      line-height: 32px;
      align-items: center;
      border-radius: 2px;
      text-decoration: none;
      transition: 0.1s linear;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
      display: inline-block;
      :hover,
      &.active {
         color: #fff;
         background: #1bb9f0;
      }
   }
`

export const Content = styled.main`
   width: 100%;
   padding: 16px;
   scroll-behavior: smooth;
   > div {
      max-width: 560px;
   }
`
