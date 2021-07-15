import React from 'react'
import styled from 'styled-components'

export default function ProductDescription({ description }) {
   return (
      <Wrapper>
         <h3>Product Description</h3>
         <p>{description.shortDescription}</p>
         <p>{description.longDescription}</p>
      </Wrapper>
   )
}

const Wrapper = styled.div`
   margin: 4rem 0;
   width: 90%;

   h3 {
      font-size: 28px;
      color: #555b6e;
   }

   p {
      font-size: 14px;
      line-height: 20px;
      color: #888d9d;

      margin: 16px 0;
   }
`
