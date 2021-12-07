import styled from 'styled-components'

export const StyledWrapper = styled.div`
   margin-top: 50px;
   button.edit-button {
      margin-top: 14px;
      color: rgb(32, 32, 32);
      border: 1px solid rgb(229, 229, 229);
      border-radius: 2px;
      box-shadow: rgb(0 0 0 / 2%) 0px 2px 0px;
   }
   h3.ant-typography {
      margin-bottom: 12px !important;
   }
   span.ant-typography {
      color: #919699;
      font-size: 14px;
   }
   .anticon {
      margin-left: 5px;
   }
   .ant-card {
      width: 80%;
      margin-top: 10px;
      border: 1px solid #e4e4e4;
      border-radius: 4px;

      .ant-card-body > p,
      h4.ant-typography {
         white-space: nowrap;
         overflow: hidden;
         text-overflow: ellipsis;
      }
   }

   .ant-card-cover > button {
      width: 100%;
      box-shadow: none;
      border: 1px solid rgb(228, 228, 228);
      border-radius: 0px;
   }
`
export const ImageContainer = styled.div`
   display: flex;
   flex-direction: row-reverse;
   justify-content: flex-end;
   width: 464px;
   height: 128px;
   position: relative;
   margin-bottom: 16px;
   img {
      object-fit: cover;
      border-radius: 8px;
      width: 170px;
      height: 120px;
   }
   div {
      span {
         margin-right: 16px;
         cursor: pointer;
      }
   }
   .iconButton > button {
      background: transparent;
   }
`
