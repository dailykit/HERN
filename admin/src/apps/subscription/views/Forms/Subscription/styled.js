import styled from 'styled-components'

export const Wrapper = styled.div`
   width: 100%;
   overflow: hidden;
   background: #e3e3e3;
   height: calc(100vh - 40px);
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
         &[data-selected] {
            span {
               color: #fff;
            }
         }
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
justify-content: space-between;
input[type='text'] {
   width: 340px;
}
`
export const ImageContainer = styled.div`
   padding: 8px;
   position: relative;
   border-radius: 2px;
   border: 1px solid #e3e3e3;
   height: ${props => props.height || 'auto'};
   width: ${props => props.width || 'auto'};
   img {
      width: 100%;
      height: 100%;
      object-fit: cover;
   }
   div {
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      position: absolute;
      background: linear-gradient(
         212deg,
         rgba(0, 0, 0, 1) 0%,
         rgba(255, 255, 255, 0) 29%
      );
   }
   button {
      float: right;
      margin: 4px 4px 0 0;
   }
`
