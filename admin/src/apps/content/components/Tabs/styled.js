import styled, { css } from 'styled-components'

export const StyledTabs = styled.ul`
   flex: 1;
   display: flex;
   border-left: 1px solid #b4d5e6;
`

export const StyledTab = styled.li(
   ({ active }) => css`
      width: 220px;
      height: 40px;
      display: grid;
      cursor: pointer;
      align-items: center;
      grid-template-columns: 1fr 40px;
      background: ${active ? '#fff' : 'transparent'};
      border-right: 1px solid #b4d5e6;
      &.in_dropdown {
         background: ${active ? '#d3e5ef' : 'transparent'};
         button {
            background: ${active ? '#d3e5ef' : 'transparent'};
         }
      }
      span {
         padding-left: 12px;
         text-overflow: ellipsis;
         white-space: nowrap;
         overflow: hidden;
         align-self: center;
      }
      button {
         height: 40px;
         border: none;
         display: flex;
         cursor: pointer;
         align-items: center;
         justify-content: center;
         background: ${active ? 'transparent' : '#d3e5ef'};
         :hover {
            background: #f5f5f5;
         }
      }
   `
)

export const Button = styled.button`
   width: 40px;
   height: 40px;
   border: none;
   display: flex;
   cursor: pointer;
   align-items: center;
   background: transparent;
   justify-content: center;
   border-left: 1px solid #b4d5e6;
   :hover {
      background: #f5f5f5;
   }
`

export const Dropdown = styled.div`
   top: 44px;
   right: 8px;
   width: 240px;
   z-index: 1000;
   max-height: 240px;
   position: fixed;
   background: #fff;
   overflow-y: auto;
   box-shadow: 0 0 16px rgba(0, 0, 0, 0.2);
   border-radius: 2px;
   li {
      width: 100%;
      border-right: none;
      &#close_all {
         height: 40px;
         display: flex;
         cursor: pointer;
         background: #fff;
         padding-left: 12px;
         align-items: center;
         :hover {
            background: #d3e5ef;
         }
      }
   }
   ul > span {
      height: 40px;
      display: flex;
      align-items: center;
      padding: 0 12px;
   }
`
