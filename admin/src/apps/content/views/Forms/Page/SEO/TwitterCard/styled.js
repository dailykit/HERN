import styled from 'styled-components'

export const StyledWrapper = styled.div`
   margin-top: 52px;
   margin-bottom: 100px;
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
      .ant-card-body > p {
         white-space: nowrap;
         overflow: hidden;
         text-overflow: ellipsis;
         font-size: 14px;
         font-weight: 400;
         span {
            color: #32536a;
         }
      }
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
      position: absolute;
      padding: 12px;
      right: 0;
      left: 0;
      text-align: right;
      span {
         margin-right: 16px;
         cursor: pointer;
      }
   }
`
