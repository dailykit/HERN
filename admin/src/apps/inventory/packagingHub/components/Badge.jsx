import React from 'react'
import styled from 'styled-components'
import BlazeTruck from '../../assets/icons/BlazeTruck'

export default function Badge() {
   return (
      <StyledBadge>
         <BlazeTruck width="41" height="17" />
         <h4>Free Delivery!</h4>
      </StyledBadge>
   )
}

const StyledBadge = styled.div`
   width: 186px;
   height: 51px;
   margin-right: 17rem;

   display: flex;
   justify-content: space-between;
   align-items: center;
   padding: 0.9rem;

   h4 {
      font-style: italic;
      font-weight: bold;
      font-size: 16px;
      line-height: 19px;

      color: #282440;
   }
`
