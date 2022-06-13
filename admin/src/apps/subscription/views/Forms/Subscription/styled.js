import styled from 'styled-components'

export const Wrapper = styled.div`
   width: 100%;
   overflow: hidden;
   background: #e3e3e3;
   height: calc(120vh - 20px);

   #servingTabs {
      overflow-y: auto;
      height: calc(100% - 48px);
   }
   #itemCountTabs {
      overflow-y: auto;
      height: calc(100% - 96px);
   }
   #deliveryDaysTabs {
      overflow-y: auto;
      height: calc(100% - 48px);
   }
   #subscriptionTabs {
      overflow-y: auto;
      height: calc(100% - 68px);
   }
   #servingTabList,
   #deliveryDaysTabList {
      overflow-y: auto;
      height: 100%;
      > button {
         height: 40px;
         text-align: left;
         padding: 0 14px;
         flex-shrink: 0;
         > span {
            font-size: 14px;
         }
         // &[data-selected] {
         //    span {
         //       color: #fff;
         //    }
         // }
      }
   }
   #itemCountTabList {
      > button {
         height: 40px;
         text-align: left;
         padding: 0 14px;
         &[data-selected] {
            span {
               color: #05abe4;
            }
         }
      }
   }
   #itemCountTabPanels {
      height: calc(100% - 41px);
   }
   #itemCountTabPanels,
   #subscriptionTabPanels {
      /* height: calc(100% - 41px);*/
      /* height: 100%; */
      > [data-reach-tab-panel] {
         padding: 0;
         height: 100%;
         overflow-y: auto;
      }
   }
   #servingTabPanels,
   #deliveryDaysTabPanels {
      > [data-reach-tab-panel] {
         height: 100%;
         overflow-y: auto;
         padding: 0 14px 14px 14px;
      }
   }
`

export const Header = styled.header`
   padding: 14px;
   display: flex;
   background: #fff;
   align-items: center;
   justify-content: space-between;
   input[type='text'] {
      width: 340px;
   }
`

export const ItemCountSection = styled.section`
   background: #e3e3e3;
   padding: 0 14px 14px 14px;
   height: calc(100% - 48px);
`
export const MetaDetailsSection = styled.section`
   padding: 14px;
   display: flex;
   background: #fff;
   align-items: center;
   padding-left: 33px;
   justify-content: space-between;
   input[type='text'] {
      width: 340px;
   }
   h6 {
      color: #367bf5;
      display: inline-block;
      font-size: 14px;
      font-weight: 500;
      padding: 6px;
      white-space: nowrap;
      overflow: hidden;
      border: none;
   }
   .metadetail_container {
      gap: 25px;
      border: 2px solid #f3f3f3;
      border-radius: 8px;
   }
`
export const ImageContainer = styled.div`
   display: flex;
   flex-direction: row-reverse;
   flex: ${props => props.flex || 'none'};
   padding: ${props => props.padding || '8px'};
   position: relative;
   border-radius: 2px;
   border: ${props => props.border || '1px solid #e3e3e3'};
   height: ${props => props.height || 'auto'};
   width: ${props => props.width || 'auto'};
   img {
      width: 100%;
      height: 100%;
      object-fit: cover;
   }
   div {
      width: min-content;
      background: transparent;
   }
   button {
      float: right;
      margin: 4px 4px 0 0;
   }
`
export const TagContainer = styled.div`
   flex: 1;
   padding: 14px;
   span {
      padding: 5px;
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: 11px;
   }
`
