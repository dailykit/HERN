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
`
