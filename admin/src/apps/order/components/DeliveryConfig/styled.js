import styled, { css } from 'styled-components'

export const Wrapper = styled.main`
   height: 100%;
   [data-type='tunnel-content'] {
      border-top: 1px solid #e3e3e3;
      padding: 16px 16px 0 16px;
      overflow-y: scroll;
      height: calc(100% - 104px);
   }
   [data-type='delivery-states'] {
      margin-bottom: 16px;
   }
`

export const StyledList = styled.ul`
   margin-top: 14px;
   li {
      height: 56px;
      display: flex;
      cursor: pointer;
      list-style: none;
      padding: 12px;
      align-items: center;
      border: 1px solid #e3e3e3;
      justify-content: space-between;
      :hover {
         background: rgba(220, 220, 220, 0.25);
      }
      + li {
         border-top: none;
      }
      section {
         display: flex;
         align-items: center;
         input {
            margin-right: 16px;
         }
      }
   }
`

const progress = ({ request, assignment, pickup, dropoff }) => {
   if (request !== 'SUCCEEDED') {
      if (request === 'WAITING') return '0'
      if (request === 'IN_PROGRESS') return '13%'
      if (request === 'SUCCEEDED') return '23%'
   }

   if (assignment !== 'SUCCEEDED') {
      if (assignment === 'WAITING') return '23%'
      if (assignment === 'IN_PROGRESS') return '33%'
      if (assignment === 'SUCCEEDED') return '44%'
   }

   if (pickup !== 'SUCCEEDED') {
      if (pickup === 'WAITING') return '44%'
      if (pickup === 'IN_PROGRESS') return '55%'
      if (pickup === 'SUCCEEDED') return '66%'
   }

   if (dropoff === 'WAITING') return '66%'
   if (dropoff === 'IN_PROGRESS') return '76%'
   if (dropoff === 'SUCCEEDED') return '90%'

   return '0'
}

export const DeliveryStates = styled.ul(
   ({ status }) => css`
      margin-top: 14px;
      position: relative;
      :after {
         top: 6%;
         width: 6px;
         left: 6.3px;
         content: '';
         position: absolute;
         border-radius: 6px;
         background: #34bc17;
         height: ${progress(status)};
      }
      :before {
         top: 6%;
         width: 6px;
         left: 6.3px;
         content: '';
         position: absolute;
         border-radius: 6px;
         background: #e7e7e7;
         height: 90%;
      }
   `
)

export const StyledDeliveryCard = styled.li`
   padding: 14px;
   list-style: none;
   background: #fff;
   margin-left: 28px;
   position: relative;
   border: 1px solid #e3e3e3;
   + li {
      margin-top: 16px;
   }
   :before {
      width: 12px;
      content: '';
      left: -28px;
      height: 12px;
      z-index: 20;
      background: #fff;
      position: absolute;
      border-radius: 50%;
      top: calc(50% - 6px);
      border: 2px solid #34bc17;
   }
   section[data-type='status'] {
      width: 100%;
      display: flex;
      flex-direction: column;
      > span:first-child {
         display: flex;
         color: #a0aec0;
         font-size: 14px;
         font-weight: 500;
         text-transform: uppercase;
         justify-content: space-between;
      }
   }
   > div {
      margin-top: 6px;
   }
`

export const StyledDeliveryBy = styled.div`
   display: flex;
   margin-bottom: 16px;
   align-items: center;
   justify-content: space-between;
`

const statePicker = status => {
   switch (status) {
      case 'WAITING':
         return css`
            color: #696161;
            background: #d7eded;
         `
      case 'IN_PROGRESS':
         return css`
            color: #fff;
            background: #5d83f5;
         `
      case 'SUCCEEDED':
         return css`
            color: #fff;
            background: #68b53c;
         `
      default:
         return css`
            color: #696161;
            background: #d7eded;
         `
   }
}

export const StyledTag = styled.span(
   ({ status }) => css`
      ${statePicker(status)}
      padding: 2px 7px;
      border-radius: 4px;
      font-size: 13px;
      margin-left: 8px;
   `
)

export const StyledTime = styled.div`
   position: absolute;
   top: 0.5rem;
   left: 0.5rem;
   padding: 0.5rem;
   margin: 0;
   z-index: 100;
   border-radius: 4px;
   background: #5d83f5;
   color: #fff;
`
