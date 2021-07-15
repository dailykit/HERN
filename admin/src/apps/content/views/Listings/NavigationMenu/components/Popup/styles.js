import styled from 'styled-components'

export const Modal = styled.div`
   display: ${props => (props.isPopupActive ? 'block' : 'none')};
   position: absolute;
   right: 12px;
   top: 58px;
   z-index: 10;

   .modal-content {
      width: auto;
      min-width: 144px;
      padding: 8px 0;
      border: 1px solid #cbd6e2;
      border-radius: 3px;
      box-shadow: rgba(45, 62, 80, 0.12) 0px 1px 5px 0px;
      background: #fff;
   }

   .action-list {
      list-style: none;
      margin: 0;
      padding: 0;
   }

   .action-list-item {
      list-style: none;
      cursor: pointer;
   }

   .list-btn {
      -webkit-font-smoothing: auto;
      -moz-osx-font-smoothing: auto;
      font-family: Avenir Next W02, Helvetica, Arial, sans-serif;
      font-weight: 400;
      font-size: 14px;
      -webkit-user-select: none;
      -moz-user-select: none;
      -ms-user-select: none;
      user-select: none;
      border: 0;
      border-radius: 0;
      color: #33475b;
      display: block;
      min-height: 40px;
      padding: 8px 20px;
      text-align: left;
      width: 100%;
      background-color: #fff;
      line-height: 24px;
   }

   .list-btn:hover {
      background: #e5f5f8;
      color: #33475b;
      text-decoration: none;
      cursor: pointer;
   }

   .pointer {
      position: absolute;
      pointer-events: none;
      border-style: solid;
      border-right-style: solid;
      border-bottom-style: solid;
      border-width: 1px;
      border-right-width: 1px;
      border-bottom-width: 1px;
      border-right: 1px solid rgb(203, 214, 226);
      border-bottom: 1px solid rgb(203, 214, 226);
      border-image: none 100% / 1 / 0 stretch;
      clip-path: polygon(100% 100%, 0px 100%, 100% 0px);
      border-top-left-radius: 100%;
      border-top-color: transparent !important;
      border-left-color: transparent !important;
      width: 20px;
      height: 20px;
      background-color: inherit;
      transform: rotate(-135deg);
      top: -10px;
      left: calc(50% - 10px);
      background: #fff;
   }
`
