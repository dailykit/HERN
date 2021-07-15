import styled from 'styled-components'

export const StyledTable = styled.table`
   thead {
      height: 30px;
      border-top: 1px solid rgba(136, 141, 157, 0.3);
      border-bottom: 1px solid rgba(136, 141, 157, 0.3);

      th {
         font-weight: 500;
         font-size: 12px;
         line-height: 14px;
         color: #888d9d;
         text-align: left;
      }
   }
`

export const Preview = styled.span`
   img {
      width: 100px;
      height: 60px;
      object-fit: cover;
   }
`

export const Pill = styled.span`
   background: ${props =>
      props.active
         ? ' linear-gradient(180deg, #28C1F7 -4.17%, #00A7E1 100%)'
         : '#f3f3f3'};
   color: ${props => (props.active ? '#fff' : '#555B6E')};
   border-radius: 50px;
   padding: 4px 12px;
   font-weight: 500;
   font-size: 14px;
   line-height: 16px;
   margin-right: 8px;
`
