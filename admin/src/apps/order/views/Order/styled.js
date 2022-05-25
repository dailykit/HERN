import { Flex } from '@dailykit/ui'
import styled, { css } from 'styled-components'

const selectBg = status => {
   if (status === 'PACKED') {
      return '#79df54' // green
   }
   if (status === 'PENDING') {
      return '#f9daa8' // pending
   }
   if (status === 'READY') {
      return '#65c6ff' // processing
   }
   return ''
}

export const Styles = {
   Products: styled.ul(
      () => css`
         display: grid;
         grid-gap: 16px;
         grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      `
   ),
   ProductItem: styled.li(
      ({ isActive }) => css`
         padding: 12px;
         display: flex;
         cursor: pointer;
         list-style: none;
         border-radius: 2px;
         ${isActive && `color: #fff`};
         background: ${isActive ? '#353244' : '#f3f3f3'};
         aside {
            width: 80px;
            overflow: hidden;
            margin-right: 14px;
         }
         img {
            width: 100%;
            object-fit: cover;
            border-radius: 2px;
         }
         h3 {
            font-size: 14px;
            font-weight: 500;
            line-height: 14px;
         }
         .flex-wrap {
            display: flex;
            align-items: center;
            justify-content: space-between;
            flex-wrap: wrap;
            gap: 8px;
         }
      `
   ),
}

export const Scroll = {
   Tabs: styled.ul`
      display: flex;
      padding: 0 20px 0 0;
      border-bottom: 1px solid #c9e1ff;
   `,
   Tab: styled.li`
      list-style: none;
      a {
         height: 32px;
         color: #888d9d;
         font-size: 16px;
         margin-right: 14px;
         display: inline-block;
         letter-spacing: 0.3px;
         text-decoration: none;
         background: transparent;
         border-bottom: 2px solid transparent;
      }
      &.active {
         a {
            color: #05abe4;
            border-bottom: 2px solid #05abe4;
         }
      }
   `,
}

export const StyledProductTitle = styled.span`
   font-weight: 400;
   font-size: 16px;
   line-height: 14px;
`

export const List = {
   Head: styled.header(
      () => css`
         height: 32px;
         display: grid;
         grid-gap: 16px;
         line-height: 32px;
         grid-template-columns: repeat(4, 1fr) 48px;
         > div > span:first-child {
            color: #888d9d;
            font-size: 14px;
            font-weight: 400;
            padding-left: 14px;
         }
      `
   ),
   Body: styled.div(() => css``),
   Item: styled.div(
      ({ isOpen, status }) => css`
         overflow: hidden;
         margin-bottom: 4px;
         header {
            height: 48px;
            display: grid;
            grid-gap: 16px;
            line-height: 48px;
            border-radius: 2px 2px 0 0;
            ${isOpen &&
            css`
               border-left: 5px solid rgba(0, 0, 0, 0.3);
            `};
            grid-template-columns: repeat(4, 1fr) 48px;
            background: ${selectBg(status)};
            > span {
               padding: 0 14px;
               overflow: hidden;
               white-space: nowrap;
               text-overflow: ellipsis;
            }
            button {
               border: none;
               display: flex;
               cursor: pointer;
               align-items: center;
               background: transparent;
               justify-content: center;
               :hover {
                  background: rgba(0, 0, 0, 0.05);
               }
               :focus {
                  outline: none;
                  background: rgba(0, 0, 0, 0.1);
               }
            }
         }
         main {
            padding: 16px;
            grid-gap: 24px;
            border-radius: 0 0 2px 2px;
            border-left: 1px solid #e9e9e9;
            border-right: 1px solid #e9e9e9;
            border-bottom: 1px solid #e9e9e9;
            display: ${isOpen ? 'grid' : 'none'};
            grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
         }
      `
   ),
   Badge: styled.span`
      color: #fff;
      font-size: 14px;
      padding: 1px 4px;
      border-radius: 2px;
      margin-right: 3px;
      background: rgba(0, 0, 0, 0.2);
   `,
}

export const Legend = styled.div`
   display: flex;
   margin: 16px 0;
   align-items: center;
   h2 {
      font-size: 18px;
      font-weight: 400;
      margin-right: 24px;
   }
   section {
      margin-right: 24px;
      align-items: center;
      display: inline-flex;
      span:first-child {
         height: 8px;
         width: 20px;
         margin-right: 8px;
         border-radius: 8px;
         display: inline-block;
      }
   }
   section {
      :nth-of-type(1) {
         span:first-child {
            background: #f9daa8;
         }
      }
      :nth-of-type(2) {
         span:first-child {
            background: #65c6ff;
         }
      }
      :nth-of-type(3) {
         span:first-child {
            background: #79df54;
         }
      }
   }
`
export const ResponsiveFlex = styled(Flex)`
   @media only screen and (max-width: 767px) {
      flex-direction: column;
      align-items: flex-start;
   }
`
