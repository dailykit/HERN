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
   const imageUrlOfRemovedBg = imageUrl.slice()
   let removebgImageSrc = imageUrlOfRemovedBg.replace('images', 'images-rb')
   removebgImageSrc = removebgImageSrc.replace('jpg', 'png')
   removebgImageSrc = removebgImageSrc.replace('jpeg', 'png')

   let imageUrlOfParticularDimensionWithoutBg = imageUrlOfRemovedBg.replace(
      'images',
      `${width}x${height}-rb`
   )

   const finalImageSrc = React.useMemo(() => {
      if (removeBg && !(Boolean(width) && Boolean(height))) {
         return removebgImageSrc
      } else if (!removeBg && Boolean(width) && Boolean(height)) {
         return imageUrlOfParticularDimension
      } else if (removeBg && Boolean(width) && Boolean(height)) {
         return imageUrlOfParticularDimensionWithoutBg
      } else {
         return imageUrl
      }
   }, [])
   console.log('finalImageSrc', finalImageSrc)
   const [src, setSrc] = React.useState(finalImageSrc)
   const [error, setError] = React.useState(false)

   const propWithoutDataSrc = React.useMemo(() => {
      const dataSrc = 'data-src'
      const { [dataSrc]: datasrc, ...withoutDataSrc } = rest
      return withoutDataSrc
   }, [rest])

   if (!(width && height) && !removeBg) {
      return <img className={`lazyload ${className}`} {...rest} />
   }

   // removing data-src from rest bcz data-src using dynamically by state

   return (
      <img
         className={`lazyload ${className}`}
         data-src={src}
         // src={src}
         onError={async ({ currentTarget }) => {
            if (!error) {
               // changing class to lazyloding to lazyload so that lazysizes reload the new image
               currentTarget.className = currentTarget.className.replace(
                  'lazyloading',
                  'lazyload'
               )
               if (removeBg && !(Boolean(width) && Boolean(height))) {
                  // remove only background
                  const fallbackImageUrl = `${get_env(
                     'BASE_BRAND_URL'
                  )}/server/api/assets/serve-image?removebg=true&src=${imageUrl}`
                  const imageData = await axios.get(fallbackImageUrl)
                  setSrc(imageData.data)
               } else if (!removeBg && Boolean(width) && Boolean(height)) {
                  // resize image only
                  const fallbackImageUrl = `${get_env(
                     'BASE_BRAND_URL'
                  )}/server/api/assets/serve-image?width=${width}&height=${height}&src=${imageUrl}`
                  const imageData = await axios.get(fallbackImageUrl)
                  setSrc(imageData.data)
               } else if (removeBg && Boolean(width) && Boolean(height)) {
                  // remove background and resize image
                  const fallbackImageUrl = `${get_env(
                     'BASE_BRAND_URL'
                  )}/server/api/assets/serve-image?width=${width}&height=${height}&src=${imageUrl}&removebg=true`
                  const imageData = await axios.get(fallbackImageUrl)
                  setSrc(imageData.data)
               }
               setError(true)
            }
         }}
         {...propWithoutDataSrc}
      />
   )
}
