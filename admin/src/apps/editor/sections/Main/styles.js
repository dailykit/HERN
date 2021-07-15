import styled, { css } from 'styled-components'
import { Tabs, TabList, Tab, TabPanel } from '@reach/tabs'

export const MainWrapper = styled.main(
   ({ theme, isSidebarVisible, isSidePanelVisible, width }) => css`
      grid-area: main;
      border: 1px solid ${theme.border.color};
      position: relative;
      width: ${width};
      height: 100vh;
   `
)

export const TabsNav = styled.div(
   ({ theme }) => css`
      background: #fff;
      position: absolute;
      top: 0;
      right: 0;
      height: ${theme.basePt * 5}px;
      width: auto;
      border-left: 1px solid ${theme.border.color};
      border-bottom: 1px solid ${theme.border.color};
      z-index: 100;
      span {
         width: ${theme.basePt * 5}px;
         height: ${theme.basePt * 5}px;
         float: left;
         cursor: pointer;
         display: flex;
         align-items: center;
         justify-content: center;
         &:hover {
            background: rgba(0, 0, 0, 0.1);
         }
      }
   `
)

export const TabOptions = styled.div(
   ({ theme }) => css`
      background: #fff;
      border: 1px solid ${theme.border.color};
      top: ${theme.basePt * 6}px;
      right: 0;
      position: absolute;
      padding: ${theme.basePt}px 0;
      width: 240px;
      ul {
         li {
            cursor: pointer;
            height: ${theme.basePt * 4}px;
            line-height: 33px;
            padding: 0 ${theme.basePt * 2}px;
            &:hover {
               background: rgba(0, 0, 0, 0.1);
            }
         }
      }
   `
)
export const StyledTabs = styled(Tabs)`
   height: 100%;
   display: grid;
   grid-template-rows: 40px 1fr;
`

export const StyledTabList = styled(TabList)(
   ({ theme }) => css`
      display: flex;
      overflow-x: auto;
      overflow-y: hidden;
      border-bottom: 1px solid ${theme.border.color};
   `
)

export const StyledTab = styled(Tab)(
   ({ theme }) => css`
      flex: 1;
      height: ${theme.basePt * 5 - 1}px;
      padding: 0;
      max-width: 180px;
      min-width: 180px;
      background: transparent;
      border: none;
      text-align: left;
      cursor: pointer;
      display: flex;
      justify-content: space-between;
      border-right: 1px solid ${theme.border.color};
      span {
         height: ${theme.basePt * 5 - 2}px;
         &:hover {
            background: ${theme.colors.light};
         }
      }
      span:first-child {
         width: calc(100% - ${theme.basePt * 5 - 1}px);
         line-height: ${theme.basePt * 5 + 1}px;
         padding-left: ${theme.basePt * 2}px;
      }
      span:last-child {
         width: ${theme.basePt * 5 - 1}px;
         visibility: hidden;
         display: flex;
         align-items: center;
         justify-content: center;
         &:hover {
            background: ${theme.colors.light};
         }
      }
      &:hover {
         span:last-child {
            visibility: visible;
         }
      }
      &[aria-selected='true'] {
         border-bottom: 1px solid ${theme.border.color};
      }
   `
)

export const StyledTabPanel = styled(TabPanel)`
   height: calc(100vh - 72px);
   &:focus {
      outline: none;
   }
`
