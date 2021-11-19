import styled from 'styled-components'

export const Styles = {
   ConfigTemplateUI: styled.div`
      .display-none {
         display: none;
      }
      padding: 16px;
      .edit_button{
      margin-right: -20px;
      display:none;
      }
      &:hover{
         .edit_button{
            display:flex;
            background:transparent;
         }
      }
      .ant-card-head {
         max-height:58px;
      }
   `,
   Header: styled.div`
      display: flex;
      justify-content: space-between;
      align-items: center;
   `,
   Heading: styled.div`
      color: #202020;
      font-size: 16px;
      font-style: normal;
      font-weight: 500;
      padding: 0 0 16px 0;
   `,
   ConfigTemplateHeader: styled.div`
      display: flex;
      align-items: center;
      justify-content: space-between;
      > button {
         border: none;
         background: transparent;
      }
      > .header{
         display: flex;
         flex-direction: column;
         p{padding: 4px;
            margin-left: ${({ indentation }) => indentation};
            padding-top:0px;
            padding-bottom:8px;
         }
      }
      > .header > h2 {
         font-weight: 500;
         font-size: 16px;
         line-height: 16px;
         letter-spacing: 0.16px;
         color: #919699;
         text-transform: capitalize;
         padding: 4px;
         margin-left: ${({ indentation }) => indentation};
      }
   `,
}
