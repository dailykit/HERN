import styled from 'styled-components'

export const Container = styled.div`
   width: 50%;
   margin: 24px auto;
`

export const CircleButton = styled.button`
   background-color: #fff;
   padding: 20px;
   border: 0;
   border-radius: 50%;
   width: 8rem;
   height: 8rem;
   box-shadow: -3px 4px 4px rgba(0, 0, 0, 0.05);

   img {
      width: 100%;
   }

   &:hover {
      cursor: pointer;
   }
`

export const ImageContainer = styled.div`
   width: 464px;
   height: 128px;
   position: relative;
   margin: 0 auto;
   img {
      width: 464px;
      height: 128px;
      object-fit: auto;
   }
   div {
      position: absolute;
      padding: 12px;
      right: 0;
      left: 0;
      text-align: right;
      background: linear-gradient(to bottom, #111, transparent);
      span {
         margin-right: 16px;
         cursor: pointer;
      }
   }
`
export const ResponsiveFlex = styled.div`
   display: flex;
   justify-content: space-between;
   align-items: center;
   padding: 16px 0;
   @media screen and (max-width: 767px) {
      flex-direction: column;
      align-items: flex-start;
      input[type='text'] {
         width: calc(100vw - 64px);
         margin-bottom: 8px;
      }
   }
`
