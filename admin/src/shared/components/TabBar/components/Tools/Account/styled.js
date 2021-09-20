import styled from 'styled-components'

export const Styled = {
   Wrapper: styled.div`
      position: fixed;
      width: 207px;
      right: 16px;
      top: 46px;
      background: rgba(255, 255, 255, 0.13);
      border: 1px solid #f2f3f3;
      backdrop-filter: blur(44.37px);
      border-radius: 10px;
      color: #919699;
      z-index: 9999;
      display: ${({ spinner }) => (spinner ? 'grid' : 'block')};
      place-items: ${({ spinner }) => (spinner ? 'center' : null)};
      min-height: ${({ spinner }) => (spinner ? '80px' : 'auto')};
      @media only screen and (max-width: 767px) {
         top: 46px;
         right: 0px;
         bottom: 0px;
         left: 0px;
         width: 100%;
      }
   `,
   InnerWrapper: styled.div`
      @media only screen and (max-width: 767px) {
         padding: 12px 24px;
      }
   `,

   EditSection: styled.div`
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 10px 8px 0px 12px;
      > span {
         font-style: normal;
         font-weight: bold;
         font-size: 10px;
         line-height: 16px;
         letter-spacing: 0.44px;
         text-transform: uppercase;
      }
   `,
   ImageSection: styled.div`
      display: flex;
      align-items: center;
      > img {
         height: 60px;
         width: 60px;
         border-radius: 50%;
         margin: 24px;
      }
      > div:nth-child(1) {
         margin-right: 12px;
      }
      > div {
         display: flex;
         flex-direction: column;
         color: #64696f;
         font-style: normal;
         font-weight: 500;
         > span:nth-child(1) {
            font-size: 10px;
            text-transform: uppercase;
            background-color: #e3e3e3;
            width: 40px;
            padding: 2px 4px;
         }
         > span:nth-child(2) {
            font-size: 18px;
            padding: 2px 0px;
         }
         > span:nth-child(3) {
            font-size: 12px;
         }
      }
      @media only screen and (max-width: 767px) {
         > div:nth-child(1) {
            margin-right: 12px;
         }
      }
   `,
   Contact: styled.div`
      display: flex;
      align-items: center;
      padding: 4px;
      margin-bottom: 4px;
      > span {
         font-size: 12px;
         padding: 0 4px;
      }
   `,
   Language: styled.div`
      display: flex;
      align-items: center;
      padding: 12px;
      cursor: pointer;
      > :first-child {
         padding-right: 24px;
      }
      > :last-child {
         text-transform: uppercase;
         font-weight: bold;
         font-size: 14px;
      }
      > span {
         display: flex;
         align-items: center;
      }
   `,
   Logout: styled.div`
      padding: 6px;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 100%;
      border-top: 1px solid #e0e0e0;
      > button {
         display: flex;
         align-items: center;
         justify-content: center;
         border: none;
         outline: none;
         cursor: pointer;
         padding: 10px;
         background: rgba(255, 255, 255, 0.13);
         > span {
            color: #ff5a52;
            font-weight: bold;
            font-size: 14px;
            text-transform: uppercase;
            padding: 0px 6px;
         }
      }
   `,
   ChangeLanguage: styled.div`
      position: absolute;
      top: 0;
      bottom: 0;
      right: 0;
      left: 0;
      background: rgba(255, 255, 255, 0.13);
      border: 1px solid #f2f3f3;
      backdrop-filter: blur(44.37px);
      border-radius: 10px;
   `,
   TabToggle: styled.div`
      color: #919699 !important;
      padding: 6px 12px;
      display: flex;
      align-items: center;
      width: 100%;
   `,
}
