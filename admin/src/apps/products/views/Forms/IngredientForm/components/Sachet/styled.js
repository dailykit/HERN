import styled from 'styled-components'

export const StyledTable = styled.table`
   width: 100%;
   border: 1px solid #e4e4e4;

   thead {
      background: #f3f3f3;

      tr {
         font-size: 12px;
         line-height: 14px;
         color: #888d9d;

         th {
            padding: 8px 20px;
            font-weight: normal;
            text-align: left;
         }
      }
   }

   tbody {
      tr {
         font-weight: 500;
         font-size: 14px;
         line-height: 14px;
         color: #888d9d;
         height: 100px;

         &:not(:last-child) {
            td {
               border-bottom: 1px solid #e4e4e4;
            }
         }

         td {
            padding: 0px 20px;
            align-items: center;
            height: inherit;

            span {
               cursor: pointer;
            }

            &:first-child {
               display: flex;
               position: relative;

               span.badge {
                  position: absolute;
                  background: #28c1f6;
                  text-transform: uppercase;
                  color: #fff;
                  padding: 4px;
                  top: 4px;
               }

               > div {
                  margin-right: 12px;
               }
            }
         }
      }
   }
`
