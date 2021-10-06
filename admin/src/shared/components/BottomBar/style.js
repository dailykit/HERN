import styled, { css } from 'styled-components'

const Styles = {
   Wrapper: styled.div`
      position: fixed;
      top: 46px;
      right: 100px;
      ${({ isContentOpen }) =>
         isContentOpen &&
         css`
            left: 100px;
         `};
      width: ${({ isModalOpen, isContentOpen }) =>
         isModalOpen ? (isContentOpen ? 'auto' : '330px') : '185px'};
      height: ${({ isModalOpen }) => (isModalOpen ? '588px' : '105px')};

      background: rgba(255, 255, 255, 0.13);
      border: 1px solid #f2f3f3;
      backdrop-filter: blur(44.37px);
      border-radius: 4px;
      z-index: 1010;

      @media only screen and (max-width: 565px) {
         z-index: 0;
      }
      > span {
         text-transform: uppercase;
         padding: 0px 10px;
         color: #919699;
         font-style: normal;
         font-weight: 500;
         font-size: 10px;
         line-height: 10px;
      }
   `,
   BottomBarMenu: styled.div`
      display: flex;
      justify-content: center;
      cursor: pointer;
      position: absolute;
      top: -44px;
      z-index: 1009;
   `,

   OptionsWrapper: styled.div`
      display: ${({ isModalOpen }) => (isModalOpen ? 'none' : 'block')};
      padding: 2px;
   `,
   Option: styled.p`
      font-family: Roboto;
      font-style: normal;
      font-weight: 500;
      font-size: 14px;
      line-height: 16px;
      cursor: pointer;
      padding: 10px 5px;
      display: flex;
      align-items: center;
      margin-left: 5px;
      width: 172px;
      img {
         width: 24px;
         height: 24px;
         background: #fff;
         object-fit: contain;
         border-radius: 50%;
         margin-right: 4px;
      }

      &:hover {
         background: #fff;
         color: #367bf5;
         border-radius: 4px;
      }
   `,
}
export default Styles
