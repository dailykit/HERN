import styled from 'styled-components'
import { theme } from '../../theme'

export const Wrapper = styled.div`
   width: 100%;
   max-width: 134rem;
   margin-right: auto;
   margin-left: auto;
   padding-right: 2rem;
   padding-left: 2rem;
   .filter-panel-heading {
      display: flex;
      justify-content: space-between;
      margin: ${({ isFilterSidebarVisible }) =>
         isFilterSidebarVisible ? '0 3rem 2.4rem 0' : '0 6rem 2.4rem 3rem'};
      transition: 400ms cubic-bezier(0.2, 0, 0.38, 0.9);
      .filter-button-bar {
         display: flex;
         margin: 0 -0.4rem;
         .button-toggle-filter {
            position: relative;
            align-items: center;
            border-radius: 0;
            cursor: pointer;
            display: inline-flex;
            min-width: 8rem;
            padding: 0 1.2rem;
            justify-content: center;
            user-select: none;
            vertical-align: bottom;
            white-space: nowrap;
            height: 3rem;
            color: ${theme.colors.textColor4};
            background-color: ${theme.colors.mainBackground};
            border: 1px solid ${theme.colors.textColor4};
            margin: 0 0.4rem;
            &:hover {
               background-color: #211e2e;
            }
            .flex {
               display: flex;
               align-items: center;
               span {
                  font-size: ${theme.sizes.h6};
                  font-weight: 600;
                  margin-left: 6px;
               }
            }
         }
         .filter-sort-options {
            flex: 1;
            .sort-select {
               height: 3rem;
               color: ${theme.colors.textColor4};
               background-color: ${theme.colors.mainBackground};
               border-radius: 0;
               border: 1px solid ${theme.colors.textColor4};
               cursor: pointer;
               display: block;
               padding: 0 4rem 0 1.2rem;
               width: 100%;
               &:hover {
                  background-color: #211e2e;
               }
               &:invalid,
               &[disabled] {
                  color: #6a6f73;
                  border-color: #1c1d1f;
               }
               option {
                  background: ${theme.colors.textColor4};
                  color: ${theme.colors.mainBackground};
               }
            }
         }
         .clear-filter-button {
            position: relative;
            align-items: center;
            border-radius: 0;
            border: none;
            cursor: pointer;
            justify-content: center;
            user-select: none;
            vertical-align: bottom;
            min-width: auto;
            padding: 0;
            height: 3rem;
            font-size: ${theme.sizes.h8};
            color: ${theme.colors.textColor4};
            background-color: ${theme.colors.mainBackground};
            margin: 0 0.4rem;
            white-space: nowrap;
            margin-left: 0.8rem;
            display: inline-flex;
         }
      }
      .filter-result-count-heading {
         font-size: 1.6rem;
         align-self: center;
         text-align: right;
         color: ${theme.colors.textColor4};
         display: inline-block;
      }
   }
   .filter-panel-container {
      display: flex;
      transform: ${({ isFilterSidebarVisible }) =>
         isFilterSidebarVisible ? 'translateX(0)' : 'translateX(-20%)'};
      width: ${({ isFilterSidebarVisible }) =>
         isFilterSidebarVisible ? '100%' : 'calc(100% + 20%)'};
      transition: 400ms cubic-bezier(0.2, 0, 0.38, 0.9);
      .filter-panel-sidebar {
         width: 20%;
         padding-right: ${({ isFilterSidebarVisible }) =>
            isFilterSidebarVisible ? '1rem' : '4rem'};
         margin-right: 0.8rem;
         max-height: 240rem;
         transition: 400ms cubic-bezier(0.2, 0, 0.38, 0.9);
         .sidebar-single-panel {
            border-top: 1px solid #d1d7dc;
            &:last-child {
               border-bottom: 1px solid #d1d7dc;
            }
            .single-panel-title-header {
               position: relative;
               border: none;
               cursor: pointer;
               user-select: none;
               background-color: transparent;
               min-width: auto;
               height: auto;
               vertical-align: baseline;
               border-radius: 0;
               color: #1c1d1f !important;
               text-align: left;
               white-space: normal;
               width: 100%;
               display: flex;
               align-items: flex-start;
               justify-content: space-between;
               padding: 1.6rem 0;
               .title {
                  color: ${theme.colors.textColor4};
               }
            }
            .single-panel-content-wrapper {
               display: flex;
               flex-direction: column;
               align-items: flex-start;
               max-height: 0;
               overflow: hidden;
               visibility: hidden;
               .single-panel-content {
                  height: 150px;
                  transition: height 650ms;
                  overflow: hidden;
                  list-style: none;
                  color: #fff;
                  padding: 1rem;
                  label {
                     display: flex;
                     align-items: center;
                     padding: 4px 0;
                     li {
                        margin-left: 8px;
                        font-size: ${theme.sizes.h9};
                     }
                  }
               }
               .read-more-btn {
                  border: none;
                  text-align: center;
                  text-transform: uppercase;
                  font-weight: 600;
                  font-size: 16px;
                  color: ${theme.colors.textColor};
                  background: ${theme.colors.mainBackground};
                  cursor: pointer;
                  text-decoration: none;
                  padding: 8px 0;
                  margin: 0 auto;
               }
            }
            .active {
               max-height: none;
               overflow: visible;
               visibility: visible;
            }
         }
      }
      .filter-panel-filtered-list {
         position: relative;
         flex: 1;
         min-width: 1px;
      }
   }
   @media (max-width: 769px) {
      .filter-panel-heading {
         margin: 0 0 2.4rem 0;
         .filter-button-bar {
            width: 100%;
            .clear-filter-button {
               display: none;
            }
         }
         .filter-result-count-heading {
            display: none;
         }
      }
      .filter-panel-container {
         width: 100%;
         transform: none;
         .filter-panel-sidebar {
            display: none;
            width: 0%;
         }
         .filter-panel-filtered-list {
            position: relative;
            flex: 1;
            min-width: 1px;
         }
      }
   }
`

export const MobileViewFilterContainer = styled.div`
   width: 100%;
   padding: 16px;
   .flex {
      display: flex;
      align-items: center;
      justify-content: space-between;
   }
   .clear-filter-button {
      position: relative;
      align-items: center;
      border-radius: 0;
      border: none;
      cursor: pointer;
      justify-content: center;
      user-select: none;
      vertical-align: bottom;
      min-width: auto;
      padding: 0;
      height: 3rem;
      font-size: ${theme.sizes.h8};
      color: ${theme.colors.textColor4};
      background-color: ${theme.colors.mainBackground};
      margin: 0 0.4rem;
      white-space: nowrap;
      margin-left: 0.8rem;
      display: inline-flex;
   }

   .filter-result-count-heading {
      font-size: 1.6rem;
      align-self: center;
      text-align: right;
      color: ${theme.colors.textColor4};
      display: inline-block;
   }
   .filter-panel-container {
      display: flex;
      width: 100%;
      transition: 400ms cubic-bezier(0.2, 0, 0.38, 0.9);
      .filter-panel-sidebar {
         width: 100%;

         margin-right: 0.8rem;
         max-height: 240rem;
         transition: 400ms cubic-bezier(0.2, 0, 0.38, 0.9);
         .sidebar-single-panel {
            border-top: 1px solid #d1d7dc;
            &:last-child {
               border-bottom: 1px solid #d1d7dc;
            }
            .single-panel-title-header {
               position: relative;
               border: none;
               cursor: pointer;
               user-select: none;
               background-color: transparent;
               min-width: auto;
               height: auto;
               vertical-align: baseline;
               border-radius: 0;
               color: #1c1d1f !important;
               text-align: left;
               white-space: normal;
               width: 100%;
               display: flex;
               align-items: flex-start;
               justify-content: space-between;
               padding: 1.6rem 0;
               .title {
                  color: ${theme.colors.textColor4};
               }
            }
            .single-panel-content-wrapper {
               display: flex;
               flex-direction: column;
               align-items: flex-start;
               max-height: 0;
               overflow: hidden;
               visibility: hidden;
               .single-panel-content {
                  height: 150px;
                  transition: height 650ms;
                  overflow: hidden;
                  list-style: none;
                  color: #fff;
                  padding: 1rem;
                  label {
                     display: flex;
                     align-items: center;
                     padding: 4px 0;
                     li {
                        margin-left: 8px;
                        font-size: ${theme.sizes.h9};
                     }
                  }
               }
               .read-more-btn {
                  border: none;
                  text-align: center;
                  text-transform: uppercase;
                  font-weight: 600;
                  font-size: 16px;
                  color: ${theme.colors.textColor};
                  background: ${theme.colors.mainBackground};
                  cursor: pointer;
                  text-decoration: none;
                  padding: 8px 0;
                  margin: 0 auto;
               }
            }
            .active {
               max-height: none;
               overflow: visible;
               visibility: visible;
            }
         }
      }
      .filter-panel-filtered-list {
         position: relative;
         flex: 1;
         min-width: 1px;
      }
   }
`
