import styled from 'styled-components'

export const StyledWrapper = styled.div`
   box-sizing: border-box;
   outline: none;
   font-size: 14px;
   margin: 0 16px 16px 16px;
   position: relative;
   .menuItemDiv {
      width: 100%;
      height: 55px;
      border: 1px solid #cbd6e2;
      border-radius: 3px;
      display: flex;
      position: relative;
      box-shadow: rgba(45, 62, 80, 0.12) 0px 1px 5px 0px;
      padding: 8px;
      padding-left: 24px;
      align-items: center;
      background: #fff;
   }

   .menuContent-left {
      flex: 1 1 auto;
      padding-right: 8px;
      display: flex;
      align-items: center;
   }

   .menu-left-option {
      width: 100%;
   }

   .chevronIcon {
      padding: 6px;
      color: #0091ae;
      cursor: pointer;
   }

   .menu-item-label-input {
      padding: 10px;
      border-radius: 3px;
      border: 1px solid #cbd6e2;
      font-size: 14px;
      transition: all 0.15s ease-out;
      background-color: #f5f8fa;
      color: #33475b;
      display: block;
      height: 40px;
      line-height: 22px;
      text-align: left;
      vertical-align: middle;
      width: 100%;
   }

   .menu-item-label-input:focus {
      border-color: rgba(0, 208, 228, 0.5);
      box-shadow: 0 0 4px 1px rgba(0, 208, 228, 0.3), 0 0 0 1px #00d0e4;
      outline: 0;
   }

   .menuContent-right {
      width: calc(50% + 68px);
      padding-left: 8px;
   }

   .menuContent-right-item {
      height: 100%;
      display: flex;
      align-items: center;
   }
   .menu-right-option {
      padding-right: 12px;
      flex: 1 0 auto;
      max-width: calc(100% - 123px);
   }

   .action {
      display: ${props => (props.isPopupActive ? 'flex' : 'none')};
   }

   .menuContent-right-item:hover .action {
      display: flex;
   }

   .action-button-option {
      background-color: transparent;
      border-color: transparent;
      font-family: Avenir Next W02, Helvetica, Arial, sans-serif;
      font-weight: 600;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
      transition: all 0.15s ease-out;
      color: #0091ae;
      text-decoration: none;
      -webkit-user-select: inherit;
      -moz-user-select: inherit;
      -ms-user-select: inherit;
      user-select: inherit;
      border: 0;
      display: flex;
      font-size: inherit;
      line-height: inherit;
      overflow: visible;
      padding: 0;
      text-align: inherit;
      vertical-align: inherit;
      white-space: normal;
      cursor: pointer;
      border-radius: 3px;
      max-width: 100%;
      font-size: 14px;
      align-items: center;
      justify-content: space-between;
   }

   .delete-button-option {
      font-size: 14px;
      width: auto;
      margin-left: 12px;
      text-align: center;
   }
`

// export const Modal = styled.div`

// `
// *{
//     box-sizing: border-box;
//     outline: none;
//     font-size: 14px;
//   }

//   .active{
//     display: block;
//   }
