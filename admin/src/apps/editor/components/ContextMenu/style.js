import styled from 'styled-components'

export const Menu = styled.div`
   box-shadow: 0 4px 5px 3px rgba(0, 0, 0, 0.2);
   position: absolute;
   width: 100%;
   display: none;
   z-index: 100;
   background-color: #d9e9f1;
`

export const MenuOptions = styled.ul`
   list-style: none;
   padding: 10px 0;
`

export const MenuOption = styled.li`
   display: flex;
   align-items: center;
   font-weight: 500;
   font-size: 14px;
   padding: 10px 40px 10px 20px;
   cursor: pointer;
   &:hover {
      margin-right: 4px;
      background: #f1f3f4;
      border-radius: 0 50px 50px 0;
   }
`
export const Card = styled.div`
   display: flex;
   flex-direction: column;
   align-items: center;
   justify-content: space-between;
   box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2);
   transition: 0.3s;
   background-color: #ffffff;
   width: 100%;
   margin: 0 8px;
   padding: 16px;
   cursor: pointer;
   &:hover {
      box-shadow: 0 8px 16px 0 rgba(0, 0, 0, 0.2);
      background-color: #e5e5e5;
      p {
         font-weight: bold;
      }
   }
   p {
      margin-top: 8px;
   }
`
export const Cross = styled.span`
   margin: 0;
   cursor: pointer;
   svg {
      &:hover {
         stroke: red;
      }
   }
`
