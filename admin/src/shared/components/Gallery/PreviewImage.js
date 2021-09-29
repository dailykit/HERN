import React from 'react'
import { WrapperDiv, Image, Images, Wrapper } from './styled'
import { ButtonTile } from '@dailykit/ui'
const PreviewImage = ({ images, current, openTunnel, setActive }) => {
   return (
      <Wrapper>
         <Images>
            {images.map((img, index) => (
               <WrapperDiv key={`img${index}`}>
                  <Image
                     key={`img${index}`}
                     active={index === current}
                     src={img}
                     alt="small product"
                     onClick={e => e.stopPropagation() || setActive(index)}
                  />
               </WrapperDiv>
            ))}
         </Images>
         <ButtonTile
            type='uploadImage'
            size='lg'
            text={!images.length ? 'Add a Photo' : null}
            onClick={() => openTunnel(1)}
            style={
               images.length
                  ? { marginLeft: '16px', width: '4.25rem', height: '4.25rem' }
                  : null
            }
         />
      </Wrapper>
   )
}

export default PreviewImage
