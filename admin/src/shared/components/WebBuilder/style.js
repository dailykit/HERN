import styled from 'styled-components'

export const StyledDiv = styled.div`
   grid-area: main;
   #gjs {
      border: none;
   }

   /* Reset some default styling */
   .gjs-cv-canvas {
      top: 0;
      width: 85%;
      height: 100%;
      z-index: 0;
   }
   .gjs-cstmBlock {
      width: auto;
      height: auto;
      min-height: auto;
   }

   .panel__top {
      padding: 0;
      width: 100%;
      display: flex;
      position: initial;
      justify-content: center;
      justify-content: space-between;
   }
   .panel__basic-actions {
      position: initial;
   }

   .editor-row {
      display: flex;
      justify-content: flex-start;
      align-items: stretch;
      flex-wrap: nowrap;
      height: 86vh;
   }

   .editor-canvas {
      flex-grow: 1;
   }

   .panel__left {
      flex-basis: 230px;
      position: relative;
      overflow-y: auto;
   }

   .panel__switcher {
      position: initial;
   }

   .panel__devices {
      position: initial;
   }

   .gjs-one-bg {
      background-color: white;
   }

   /* Secondary color for the text color */
   .gjs-two-color {
      color: black;
   }

   /* Tertiary color for the background */
   .gjs-three-bg {
      background: white;
      color: black;
   }

   /* Quaternary color for the text color */
   .gjs-four-color,
   .gjs-four-color-h:hover {
      color: black;
   }

   .gjs-pn-btn {
      height: 30px;
      width: 30px;
      padding: 0 12px;
      font-weight: 500;
      font-size: 14px;
      border-radius: 1.5px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      color: #555b6e;
      background: #f3f3f3;
   }
   .gjs-pn-btn.gjs-pn-active {
      background: linear-gradient(180deg, #28c1f7 -4.17%, #00a7e1 100%);
      color: #fff;
   }

   .gjs-pn-panel {
      z-index: 0;
   }
   .gjs-pn-views {
      z-index: 4;
   }
`
