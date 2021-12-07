import styled from 'styled-components'

export const StyledWrapper = styled.div`
   .ant-input {
      font-weight: 500;
      font-size: 16px;
      background-color: transparent;
      border: none;
      box-shadow: none;
   }
   .anticon {
      margin-left: 5px;
   }
   .ant-form {
      margin-top: 50px;
   }
   .ant-card-head {
      display: none;
   }
   div.ant-typography,
   span.ant-typography {
      font-size: 14px;
      color: #919699;
   }
   .ant-input-wrapper > .ant-input-group-addon {
      font-size: 16px;
   }
   .ant-card {
      width: 80%;
      margin-top: 10px;
      border: 1px solid #e4e4e4;
      border-radius: 4px;
   }

   .ant-card-body > .link {
      color: #555b6e;
      font-size: 16px;
      font-weight: 500;
   }
   .ant-card-body > div.ant-typography-ellipsis-multiple-line {
      color: #555b6e;
      font-size: 15px;
      font-weight: 400;
   }
   .ant-modal-content {
      width: 50%;
      height: auto;
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
      width: 464px;
      height: 128px;
      object-fit: cover;
   }
   div {
      span {
         margin-right: 16px;
         cursor: pointer;
      }
   }
`
