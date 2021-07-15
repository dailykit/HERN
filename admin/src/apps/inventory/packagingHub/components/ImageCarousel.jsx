import React from 'react'
import styled from 'styled-components'

import useCarousel from '../hooks/useCarousel'

export default function ImageCarousel({ images }) {
   const { current, setActive } = useCarousel(images)

   return (
      <Wrapper>
         <img
            src={images[current]?.url}
            alt="product"
            width="90%"
            height="637px"
         />

         <Images>
            {images.map((img, index) => {
               return (
                  <Image
                     key={img.url}
                     active={index === current}
                     src={img.url}
                     alt="small product"
                     onClick={() => setActive(index)}
                  />
               )
            })}
         </Images>
      </Wrapper>
   )
}

const Images = styled.div`
   margin: 2rem 0;
   display: flex;
   flex-wrap: wrap;
   width: 90%;
`
const Image = styled.img`
   width: 4rem;
   height: 4rem;
   margin-right: 2rem;
   padding: 4px;
   border: ${({ active }) => (active ? `2px solid #02463a` : 0)};
   cursor: pointer;
`

const Wrapper = styled.div``
