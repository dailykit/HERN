import styled from 'styled-components'

export const ResponsiveFlex = styled.header`
   display: flex;
   padding: 16px 32px;
   align-items: center;
   justify-content: flex-start;

   @media screen and (max-width: 767px) {
      flex-direction: column;
      align-items: start;
      input[type='text'] {
         width: calc(100vw - 64px);
      }
      section {
         margin-bottom: 8px;
      }
   }
`
export const PageHeader = styled.div`
   display: flex;
   justify-content: space-between;
   width: 100%;
   height: 100%;
   align-items: center;
`
export const StyledCompany = styled.div`
   display: flex;
   align-items: center;
   gap: 12px;
   > img {
      width: 40px;
      height: 40px;

      border: 1px solid #f3f3f3;
      box-sizing: border-box;
      border-radius: 30px;
   }
   > div {
      font-family: 'Roboto';
      font-style: normal;
      font-weight: 500;
      font-size: 24px;
      line-height: 18px;

      color: #202020;
   }
`
export const StyledPublish = styled.div`
   font-family: 'Roboto';
   font-style: normal;
   font-weight: 500;
   font-size: 14px;
   line-height: 18px;

   letter-spacing: 0.16px;

   color: #202020;

   flex: none;
   order: 0;
   flex-grow: 0;
   margin: 0px 12px;
`
