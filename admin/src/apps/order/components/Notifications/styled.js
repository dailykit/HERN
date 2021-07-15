import styled from 'styled-components'

export const Main = styled.main`
   overflow-y: auto;
   height: calc(100% - 104px);
`

export const Notifs = styled.ul`
   padding: 14px;
   li + li {
      margin-top: 14px;
   }
`

export const Notif = styled.li`
   height: auto;
   padding: 14px;
   display: grid;
   grid-gap: 6px;
   cursor: pointer;
   list-style: none;
   grid-template-rows: auto;
   border: 1px solid #e3e3e3;
   grid-template-columns: 1fr auto;
   grid-template-areas:
      'title time'
      'description description';
   h3 {
      color: #101219;
      font-size: 16px;
      grid-area: title;
      font-weight: 400;
   }
   time {
      color: #9ca0ab;
      font-size: 14px;
      grid-area: time;
   }
   p {
      color: #9ca0ab;
      font-size: 14px;
      grid-area: description;
   }
`
