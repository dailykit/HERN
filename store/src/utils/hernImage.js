import React from 'react'
import ReactImageFallback from 'react-image-fallback'
import { get_env } from './get_env'
import axios from 'axios'
import 'lazysizes'
import 'lazysizes/plugins/parent-fit/ls.parent-fit'
import 'lazysizes/plugins/attrchange/ls.attrchange'

export const hernImage = props => {
   const imageSrc = props.imageSrc
   const isRemovebg = props.removeBg
   if (isRemovebg === false) {
      return <img src={imageSrc} alt="Image not loaded" />
   }
   var removebgImageSrc1 = imageSrc.slice()
   var removebgImageSrc = removebgImageSrc1.replace('images', 'images-rb')
   removebgImageSrc = removebgImageSrc.replace('jpg', 'png')
   removebgImageSrc = removebgImageSrc.replace('jpeg', 'png')
   const fallbackImageSrc = `${get_env(
      EXPRESS_URL
   )}/server/api/assets/serve-image?removebg=true&src=${imageSrc}`
   return (
      <>
         <ReactImageFallback
            src={removebgImageSrc}
            fallbackImage={fallbackImageSrc}
            alt="Image not loaded"
         />
      </>
   )
}

export const HernLazyImage = ({
   className = '',
   width = null,
   height = null,
   removeBg = false,
   ...rest
}) => {
   const imageUrl = rest['data-src']
   const imageUrlOfParticularDimension = imageUrl
      .slice()
      .replace('images', `${width}x${height}`)
   const imageUrlOfRemovedBf = imageUrl.slice()
   let removebgImageSrc = imageUrlOfRemovedBf.replace('images', 'images-rb')
   removebgImageSrc = removebgImageSrc.replace('jpg', 'png')
   removebgImageSrc = removebgImageSrc.replace('jpeg', 'png')

   const finalImageSrc = React.useMemo(() => {
      if (removeBg && !(Boolean(width) && Boolean(height))) {
         return removebgImageSrc
      } else if (!removeBg && Boolean(width) && Boolean(height)) {
         return imageUrlOfParticularDimension
      } else if (!removeBg && !(Boolean(width) && Boolean(height))) {
         return imageUrl
      }
   }, [])

   const [src, setSrc] = React.useState(finalImageSrc)
   const [error, setError] = React.useState(false)

   if (!(width && height)) {
      return <img className={`lazyload ${className}`} {...rest} />
   }

   return (
      <img
         className={`lazyload ${className}`}
         data-src={src}
         // src={src}
         onError={async ({ currentTarget }) => {
            if (!error) {
               currentTarget.className = currentTarget.className.replace(
                  'lazyloading',
                  'lazyload'
               )
               if (removeBg && !(Boolean(width) && Boolean(height))) {
                  const fallbackImageUrl = `http://localhost:4000/server/api/assets/serve-image?removebg=true&src=${src}`
                  const imageData = await axios.get(fallbackImageUrl)
                  setSrc(imageData.data)
               } else if (!removeBg && Boolean(width) && Boolean(height)) {
                  const fallbackImageUrl = `http://localhost:4000/server/api/assets/serve-image?width=${width}&height=${height}&src=${imageUrl}`
                  const imageData = await axios.get(fallbackImageUrl)
                  setSrc(imageData.data)
               }
               setError(true)
            }
         }}
      />
   )
}
