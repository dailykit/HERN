import styled from 'styled-components'

const Styled = {
   MainWrapper: styled.div`
      width: 100%;
      display: flex;
      justify-content: center;
      overflow: hidden;
      margin: 16px 0;
   `,
   Header: styled.div`
      font-weight: 700;
      font-size: 28px;
      line-height: 32px;
      color: #202020;
      margin-bottom: 12px;
   `,
   Wrapper: styled.div`
      position: relative;
      padding: 24px 32px;
      border: 1px solid #111b2b;
      box-sizing: border-box;
      box-shadow: 0px 4px 10px rgba(96, 215, 122, 0.2);
      border-radius: 4px;
      max-width: 960px;
      margin-top: 100px;
      width: 100%;
   `,
   Item: styled.div`
      background: #fafafa;
      border-radius: 4px;
      padding: 8px;
      margin-top: ${({ noMargin }) => (noMargin ? '0px' : '12px')};
      font-weight: 500;
      font-size: 15px;
      font-size: 15px;
      font-weight: 500;
      color: #202020;
      line-height: 20px;
      display: flex;
      align-items: center;
   `,
   Count: styled.span`
      width: 16px;
      padding-right: 4px;
      align-self: flex-start;
   `,
   Text: styled.div`
      align-self: flex-start;
   `,
   Button: styled.button`
      border: none;
      outline: none;
      cursor: pointer;
      background: transparent;
      border-radius: 50%;
      display: flex;
      align-items: center;
      z-index: 1;
      > span {
         text-transform: uppercase;
         color: #367bf5;
         font-weight: 700;
         font-size: 14px;
      }
   `,
   TutorialLink: styled.a`
      text-decoration: none;
      color: #367bf5;
      display: inline-block;
      padding: 0 8px;
      font-size: 16px;
      font-weight: 700;
      cursor: pointer;
   `,
   Decorator: styled.div`
      .plate {
         position: absolute;
         top: -95px;
         right: 46px;
      }
      .glass {
         position: absolute;
         left: -12px;
         bottom: -6px;
      }
      .plant1 {
         position: absolute;
         bottom: -8px;
         right: -60px;
      }
      .plant2 {
         position: absolute;
         left: -134px;
         top: -16px;
      }
   `,
   Image: styled.div`
      position: fixed;
      width: 100%;
      height: 100%;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      z-index: 20;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(17, 17, 17, 0.7);
      > div {
         box-shadow: 0px 2px 6px rgba(32, 32, 32, 0.1);
         > img {
            border-radius: 5px;
            min-width: 600px;
         }
      }
   `,
}
export default Styled

export const StyledActions = styled.div`
   display: flex;
   align-items: center;
   height: 40px;
   position: absolute;
   top: 40px;
   right: 0;
   padding-bottom: 20px;
   z-index: 10;
`
export const Wrapper = styled.div`
   position: relative;
`
