import styled from 'styled-components'

export const Row = styled.div`
   .arrow-down {
      width: 0;
      height: 0;
      border-left: 10px solid transparent;
      border-right: 10px solid transparent;
      border-top: 10px solid black;
      margin-bottom: 6px;
      cursor: pointer;
   }
   .dropdown-container {
      position: relative;
   }
   .dropdown-input {
      width: 260px;
      min-height: 36px;
      border-radius: 5px;
      padding: 0 8px;
      background-color: white;
      margin-top: 10px;
      display: flex;
      align-items: center;
      padding-top: 6px;
      box-shadow: 1px 1px 1px black;
   }
   .dropdown-placeholder {
      margin-bottom: 6px;
      color: dimgrey;
   }
   .dropdown-values {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      margin-left: 6px;
   }
   .dropdown-value {
      color: black;
      padding: 4px;
      background-color: #bcb7b7;
      border-radius: 20px;
      margin-right: 6px;
      margin-bottom: 6px;
      animation: expand 0.1s ease-in-out;
      display: flex;
      justify-content: center;
      align-items: center;
   }
   .dropdown-remove {
      cursor: pointer;
   }
   .dropdown-options {
      overflow: auto;
      visibility: hidden;
      position: absolute;
      top: 100%;
      opacity: 0;
      -webkit-transition: opacity 600ms, visibility 600ms;
      transition: opacity 600ms, visibility 600ms;
   }
   .dropdown-active {
      visibility: visible;
      opacity: 10;
   }
   .dropdown-item {
      width: 200px;
      display: flex;
      justify-content: flex-start;
      align-items: center;
      background-color: rgba(196, 190, 208, 0.56);
      padding: 10px;
      border-bottom: 1px dotted grey;
   }
   .dropdown-item:hover {
      background-color: #b5babe;
   }
   .dropdown-item img {
      width: 40px;
      margin-right: 20px;
   }

   @keyframes expand {
      from {
         transform: scale(0);
         opacity: 0;
      }
   }
`
