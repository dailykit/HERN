import styled, { css } from 'styled-components'

export const SidebarWrapper = styled.aside`
   grid-area: sidebar;
`

export const Header = styled.header(
   ({ theme }) => css`
      height: ${theme.basePt * 5}px;
      border-bottom: 1px solid ${theme.border.color};
      display: flex;
      align-items: center;
      justify-content: space-between;
   `
)

export const SidebarActions = styled.div(
   ({ theme }) => css`
      width: ${theme.basePt * 5}px;
      height: ${theme.basePt * 5}px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-left: 1px solid ${theme.border.color};
      .sideBarArrow {
         width: ${theme.basePt * 5}px;
         height: ${theme.basePt * 5}px;
         display: flex;
         align-items: center;
         &:hover {
            background: rgba(0, 0, 0, 0.1);
         }
      }

      .sideBarIcon {
         width: ${theme.basePt * 5}px;
         height: ${theme.basePt * 5}px;
         display: flex;
         align-items: center;
         svg:hover {
            stroke: #7a08fa;
         }
         &:hover {
            background: none;
         }
      }
   `
)

export const FileExplorer = styled.div(
   ({ theme }) => css`
      padding: ${theme.basePt * 2}px;
      overflow-y: auto;
      height: calc(100vh - ${theme.basePt * 5}px);
   `
)

export const StyledSidebar = styled.aside(
   ({ visible }) => css`
      top: 40px;
      bottom: 0;
      width: 240px;
      position: absolute;
      background: #fff;
      left: 0;
      transition: 0.3s ease-in-out;
      transform: translateX(${visible ? '0' : '-240px'});
      z-index: 2;
      border: 1px solid #e0c9c9;
      border-right: 0;
   `
)

export const StyledHeading = styled.h3`
   color: #76acc7;
   font-size: 16px;
   font-weight: 500;
   padding: 18px 12px 8px 12px;
   letter-spacing: 0.4px;
   text-transform: uppercase;
   .sideBarIcon {
      display: flex;
      padding: 0 8px;
      align-items: center;
      svg:hover {
         stroke: #7a08fa;
      }
      &:hover {
         background: none;
      }
   }
`

export const StyledList = styled.ul`
   padding: 0 12px;
`

export const StyledListItem = styled.li`
   height: 40px;
   display: flex;
   cursor: pointer;
   align-items: center;
   border-bottom: 1px solid #b4d5e6;
   :hover {
      border-bottom: 1px solid #66a1bd;
   }
`
