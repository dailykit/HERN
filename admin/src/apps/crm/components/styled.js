import styled from 'styled-components'

export const StyledSection = styled.div`
   display: ${props => (props.hasElements ? 'grid' : 'block')};
   grid-template-columns: 20% 80%;
   grid-gap: ${props => (props.spacing === 'md' ? '28px' : '40px')};
`

export const StyledListing = styled.div`
   display: flex;
   flex-direction: column;
`

export const StyledDisplay = styled.div`
   background: #fff;
   padding: ${props =>
      props.contains === 'sachets' ? '0px 28px 28px 0px' : '32px 28px'};
   margin-top: ${props => (props.contains === 'sachets' ? '16px' : '0')};
`

export const StyledListingHeader = styled.div`
   display: flex;
   justify-content: space-between;
   align-items: center;
   margin-bottom: 16px;

   h3 {
      font-weight: 500;
      font-size: 16px;
      line-height: 19px;
      color: #888d9d;
   }

   svg {
      cursor: pointer;
   }
`

export const StyledListingTile = styled.div`
   background: ${props => (props.active ? '#555B6E' : '#fff')};
   color: ${props => (props.active ? '#fff' : '#555B6E')};
   padding: 20px 12px;
   cursor: pointer;
   position: relative;
   margin-bottom: 12px;

   h3 {
      margin-bottom: 20px;
      font-weight: 500;
      font-size: 16px;
      line-height: 14px;
   }

   p {
      font-weight: normal;
      font-size: 12px;
      line-height: 14px;
      opacity: 0.7;
      &:not(:last-child) {
         margin-bottom: 8px;
      }
   }
`

export const Actions = styled.div`
   position: absolute;
   top: 20px;
   right: 0;

   span {
      margin-right: 12px;
   }
`

export const StyledTabsContainer = styled.div`
   display: flex;
   border-bottom: 1px solid rgba(206, 206, 206, 0.3);
`

export const StyledTab = styled.div`
   font-weight: 500;
   font-size: 16px;
   line-height: 14px;
   color: #888d9d;
   cursor: pointer;
   margin-right: 80px;
   padding: 16px 0;

   &.active {
      color: #00a7e1;
      border-bottom: 3px solid #00a7e1;
   }
`

export const StyledTabContent = styled.div`
   display: none;

   &.active {
      display: block;
   }
`

export const StyledTextAndSelect = styled.div`
   display: flex;
   justify-content: flex-start;
   margin-bottom: 48px;

   > div {
      max-width: 180px;
      margin-right: 16px;
   }
`

export const ToggleWrapper = styled.div`
   max-width: 156px;
   margin-bottom: 20px;
`

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

export const StyledTunnelMain = styled.div`
   padding: 0 24px 24px 24px;
`

export const StyledSelect = styled.select`
   border: none;
   font-weight: 500;
   font-size: 14px;
   line-height: 16px;
   color: #555b6e;
   outline: none;
`
// ----------------------------------------------
