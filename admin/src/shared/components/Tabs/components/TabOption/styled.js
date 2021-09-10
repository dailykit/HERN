import styled from 'styled-components'

export const Styles = {
   Wrapper: styled.div`
      position: absolute;
      width: 254px;
      max-height: 534px;
      top: 32px;
      right: 0;
      background: rgba(255, 255, 255, 0.13);
      border: 1px solid #f2f3f3;
      backdrop-filter: blur(44.37px);
      border-radius: 10px;
      z-index: 99999;
      padding-bottom: 8px;
      > span:nth-child(1) {
         margin: 8px;
      }
   `,
   SmallText: styled.span`
      font-style: normal;
      font-weight: bold;
      font-size: 10px;
      letter-spacing: 0.44px;
      text-transform: uppercase;
      color: #919699;
   `,
   Group: styled.div`
      margin: 0px 8px 2px 8px;
      padding: 12px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      background: #f7f7f7;
      border-radius: 4px;
   `,
   GroupText: styled.span`
      font-style: normal;
      font-weight: 500;
      font-size: 12px;
      line-height: 16px;
      letter-spacing: 0.44px;
      text-transform: uppercase;
      color: #202020;
   `,
   TabContainer: styled.div`
      max-height: 300px;
      overflow-y: auto;
   `,
   Tab: styled.div`
      display: flex;
      align-items: center;
      justify-content: space-between;
      background: #f7f7f7;
      border-radius: 4px;
      margin: 0px 8px 2px 8px;
      padding: 0px 12px;
      > span {
         font-style: normal;
         font-weight: 500;
         font-size: 12px;
         line-height: 16px;
         letter-spacing: 0.44px;
         color: #202020;
         cursor: pointer;
      }
      > button {
         height: 28px;
         width: 28px;
         > svg {
            stroke: #202020;
         }
      }
   `,
   CloseTab: styled.div`
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin: 20px 8px 8px 8px;
      > div {
         font-style: normal;
         font-weight: bold;
         font-size: 10px;
         line-height: 16px;
         letter-spacing: 0.44px;
         color: #367bf5;
         cursor: pointer;
      }
   `,
}
