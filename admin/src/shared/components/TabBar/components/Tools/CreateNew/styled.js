import styled from 'styled-components'

const Styles = {
   CreateNewItem: styled.li`
      display: flex;
      align-items: center;
      margin: 8px 2px;
      color: #202020;
      font-weight: 500;
      font-size: 14px;
      line-height: 14px;
      cursor: pointer;
      > span {
         display: block;
         margin-left: 6px;
      }
      &:hover {
         background: #fff;
         color: #367bf5;
         border-radius: 4px;
      }
   `,
   CreateNewWrapper: styled.ul`
      position: fixed;
      top: 46px;
      right: 56px;
      width: 210px;
      background: rgba(255, 255, 255, 0.13);
      border: 1px solid #f2f3f3;
      backdrop-filter: blur(44.37px);
      border-radius: 10px;
      z-index: 9999;
      > span {
         font-style: normal;
         font-weight: bold;
         font-size: 10px;
         line-height: 16px;
         letter-spacing: 0.44px;
         text-transform: uppercase;
         color: #919699;
         display: inline-block;
         padding: 8px 0px 0px 12px;
      }
      > div {
         display: flex;
         flex-direction: column;
         font-style: normal;
         font-weight: 500;
         font-size: 14px;
         line-height: 16px;
         letter-spacing: 0.44px;
         padding: 8px 0px 6px 12px;
      }
      @media only screen and (max-width: 767px) {
         width: 100%;
         right: 0;
         left: 0;
         bottom: 0;
         > li {
            background: #f7f7f7;
            border-radius: 4px;
            display: flex;
            align-items: center;
            padding: 8px;
            margin: 2px 8px;

            > span {
               font-weight: 500;
               font-size: 14px;
            }
         }
      }
   `,
}

export default Styles
