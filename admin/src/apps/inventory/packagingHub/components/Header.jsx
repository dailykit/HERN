import React from 'react'
import styled from 'styled-components'

import packagingHeaderBg from '../../assets/images/packagingHeaderBg.png'
import { BlazeTruck } from '../../assets/icons'

export default function Header() {
   return (
      <>
         <StyledHeader>
            <div>
               <h1>Packaging Hub</h1>
               <p>We take care of all your packaging needs.</p>
            </div>
         </StyledHeader>
         <Banner>
            <div style={{ marginRight: '24px' }}>
               <BlazeTruck />
            </div>
            <div>
               <h2>Free Delivery!</h2>
               <p>Purchase Anything! Anytime! The delivery cost is on us!</p>
            </div>
         </Banner>
      </>
   )
}

const StyledHeader = styled.header`
   height: 381px;
   width: 100%;
   background: url(${packagingHeaderBg}) no-repeat;
   background-size: cover;

   div {
      width: 100%;
      height: 100%;
      background-color: rgba(17, 17, 17, 0.7);

      display: flex;
      align-items: center;
      justify-content: center;
      flex-direction: column;
      color: #fff;
   }

   h1 {
      font-weight: 500;
      font-size: 68px;
      line-height: 94.92%;
      color: #fff;
   }

   p {
      margin-top: 24px;
      font-weight: 500;
      font-size: 24px;
      line-height: 94.92%;
   }
`
const Banner = styled.div`
   width: 100%;
   height: 123px;
   color: #fff;

   display: flex;
   align-items: center;
   justify-content: center;

   background: #282440;

   h2 {
      font-style: italic;
      font-weight: bold;
      font-size: 36px;
      line-height: 42px;
   }

   p {
      font-style: italic;
      font-weight: bold;
      font-size: 16px;
      line-height: 19px;
      margin-top: 8px;
   }
`
