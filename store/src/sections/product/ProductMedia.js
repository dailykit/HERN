import React from 'react'
import { HernLazyImage } from '../../utils/hernImage'

const ProductMedia = ({ assets, config }) => {
   const [activeImage, setActiveImage] = React.useState(0)

   return (
      <div className="hern-product-media">
         <div className="hern-product-image-gallery__preview">
            <ImageAspectRatio imageURL={assets?.images[activeImage]} />
         </div>
         <div className="hern-product-image-gallery__not-previewed">
            {assets?.images.map((image, index) => (
               <div key={index}>
                  <HernLazyImage
                     className={index === activeImage ? 'active-img' : ''}
                     dataSrc={image}
                     onClick={() => setActiveImage(index)}
                     height={52}
                     width={52}
                  />
               </div>
            ))}
         </div>
      </div>
   )
}

export default ProductMedia

const ImageAspectRatio = ({ imageURL, aspectRatio = '1/1', altText }) => {
   const isRatioValid =
      typeof Number(aspectRatio[0]) === 'number' &&
      typeof Number(aspectRatio[2]) === 'number' &&
      aspectRatio.length === 3
   const ratio = isRatioValid ? `${aspectRatio[0]}*${aspectRatio[2]}` : '1/1'

   const paddingBottom = `calc(
    100% / ${ratio}
  )`

   return (
      <div
         className="hern-product-image"
         style={{ paddingBottom: paddingBottom }}
      >
         <div>
            <div style={{ backgroundImage: `url('${imageURL}')` }}>
               {/* <ProductMedia data-src={imageURL} alt={altText} /> */}
            </div>
         </div>
      </div>
   )
}
