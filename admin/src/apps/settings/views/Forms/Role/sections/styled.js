import styled from 'styled-components'

export const StyledAppItem = styled.div`
   width: 100%;
   display: flex;
   padding: 12px 0;
   justify-content: space-between;
   border-bottom: 1px solid #ececec;
   > ul {
      display: grid;
      padding-left: 36px;
      grid-template-rows: 32px;
      grid-template-columns: 1fr;
      li {
         display: flex;
         list-style: none;
         align-items: center;
         span:first-child {
            width: 32px;
            height: 32px;
            display: flex;
            align-items: center;
            justify-content: center;
         }
      }
   }
`

export const StyledPermissions = styled.div`
   height: auto;
   > div {
      height: 40px;
      display: flex;
      align-items: center;
   }
`

export const PermissionSection = styled.section`
   + section {
      margin-top: 32px;
   }
   h3 {
      color: #3c404e;
      font-size: 18px;
      font-weight: 500;
      padding: 4px 8px;
      text-transform: capitalize;
      border-left: 2px solid #1dbaf1;
   }
   h4 {
      color: #7d8293;
      font-size: 14px;
      margin-top: 16px;
      font-weight: 600;
      padding: 0 8px;
      letter-spacing: 1.4px;
      text-transform: uppercase;
   }
   .is_empty {
      color: #aca5a5;
      display: block;
      margin: 8px 0 8px 24px;
   }
   ul.is_disabled {
      position: relative;
      ::before {
         top: -8px;
         left: 8px;
         content: '';
         z-index: 1000;
         border-radius: 2px;
         position: absolute;
         width: calc(100% + 8px);
         height: calc(100% + 16px);
         background: rgba(174, 164, 164, 0.2);
      }
      ::after {
         top: 50%;
         width: 70%;
         z-index: 1001;
         text-align: center;
         position: absolute;
         left: calc(50% + 8px);
         transform: translate(-50%, -50%);
         content: 'Enable route read permission to access these!';
      }
   }
`

export const StyledSectionItem = styled.li`
   list-style: none;
   padding-top: 16px;
`

export const StyledPermissionItem = styled.li`
   margin: 14px 0;
   list-style: none;
   padding-left: 24px;
`
