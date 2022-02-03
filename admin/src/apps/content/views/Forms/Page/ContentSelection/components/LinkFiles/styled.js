import styled from 'styled-components'

export const Wrapper = styled.div`
   padding: 8px;
   .title{
      color: #555B6E;
   }
   .selected_file{
      display: flex;
      align-items: center;
      justify-content: space-between;
      height:2rem;
      font-weight: 500;
      color: #919699;
      cursor:default;
      button{
         display:none;
      }
      &:hover {
         button{
            display:flex;
         }
         background: #F9F9F9;
      }
   }
   .linked-Files-tunnel-dropdown>div>div:nth-of-type(2) {
      max-height: 70vh;
   }
   .linked-Files-tunnel-dropdown>div>ul:nth-of-type(1){
      padding-left: 16px;
   }
   .ant-card-body{
      padding:0px 24px !important;
   }

`
