import styled from 'styled-components'
const colors = { primary: '#320E3B', secondary: '#373B48' }

const Styles = {
   Wrapper: styled.div`
      width: 100%;
      position: fixed;
      z-index: 1010;
      bottom: 0;
      left: 0;
      @media only screen and (max-width: 565px) {
         z-index: 0;
      }
   `,
   BottomBarMenu: styled.div`
      display: flex;
      justify-content: center;
      cursor: pointer;
      position: absolute;
      top: -44px;
      z-index: 1009;
      left: 45%;
   `,

   OptionsWrapper: styled.div`
      display: flex;
      width: 100vw;
      padding: 0 32px;
      cursor: pointer;
      background: #ffffff;
      @media only screen and (max-width: 565px) {
         flex-direction: column;
      }
      box-shadow: -5px 5px 10px rgba(201, 201, 201, 0.2),
         5px -5px 10px rgba(201, 201, 201, 0.2),
         -5px -5px 10px rgba(255, 255, 255, 0.9),
         5px 5px 13px rgba(201, 201, 201, 0.9),
         inset 1px 1px 2px rgba(255, 255, 255, 0.3),
         inset -1px -1px 2px rgba(201, 201, 201, 0.5);
   `,
   Option: styled.p`
      font-family: Roboto;
      font-style: normal;
      font-weight: bold;
      font-size: 12px;
      line-height: 14px;
      text-transform: uppercase;
      cursor: pointer;
      padding: 10px 16px;
      display: flex;
      align-items: center;
      img {
         width: 24px;
         height: 24px;
         background: #fff;
         object-fit: contain;
         border-radius: 50%;
         margin-right: 4px;
      }

      color: ${colors.secondary};
      background-color: #fff;
      @media only screen and (min-width: 566px) {
         color: ${({ active }) => (active ? `#fff` : `${colors.secondary}`)};
         background-color: ${({ active }) =>
            active ? `${colors.primary}` : `#fff`};
         &:hover {
            background: ${({ active }) =>
               !active ? '#f4f4f4' : `${colors.primary}`};
         }
      }
   `,
}
export default Styles
