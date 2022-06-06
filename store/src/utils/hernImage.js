import React from 'react'
import ReactImageFallback from 'react-image-fallback'
import { get_env } from './get_env'
import { isClient } from './isClient'
import axios from 'axios'
import isNull from 'lodash/isNull'
import isEmpty from 'lodash/isEmpty'
import { NoImage } from '../assets/icons'
import { useConfig } from '../lib'

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
      BASE_BRAND_URL
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
   dataSrc,
   style = {},
   ...rest
}) => {
   const { configOf } = useConfig()
   const theme = configOf('theme-color', 'Visual')?.themeColor
   const themeColor = theme?.accent?.value
      ? theme?.accent?.value
      : 'rgba(5, 150, 105, 1)'
   // no image src available
   if (isNull(dataSrc) || isEmpty(dataSrc)) {
      return <NoImage size={'60%'} fill={themeColor} />
   }
   const imageUrlOfParticularDimension = dataSrc
      .slice()
      .replace('images', `${width}x${height}`)
   const imageUrlOfRemovedBg = dataSrc.slice()
   let removebgImageSrc = imageUrlOfRemovedBg.replace('images', 'images-rb')
   removebgImageSrc = removebgImageSrc.replace('jpg', 'png')
   removebgImageSrc = removebgImageSrc.replace('jpeg', 'png')

   let imageUrlOfParticularDimensionWithoutBg = imageUrlOfRemovedBg.replace(
      'images',
      `${width}x${height}-rb`
   )
   const lowImageSizeWidth = React.useMemo(() => {
      return width / 50 < 10 ? 10 : parseInt(width / 50)
   }, [])
   const lowImageSizeHeight = React.useMemo(() => {
      return height / 50 < 10 ? 10 : parseInt(height / 50)
   }, [])

   const lowSizeBGImage = dataSrc
      .slice()
      .replace('images', `${lowImageSizeWidth}x${lowImageSizeHeight}`)

   const finalImageSrc = React.useMemo(() => {
      if (removeBg && !(Boolean(width) && Boolean(height))) {
         return removebgImageSrc
      } else if (!removeBg && Boolean(width) && Boolean(height)) {
         return imageUrlOfParticularDimension
      } else if (removeBg && Boolean(width) && Boolean(height)) {
         return imageUrlOfParticularDimensionWithoutBg
      } else {
         return dataSrc
      }
   }, [dataSrc])

   const [src, setSrc] = React.useState(finalImageSrc)
   const [error, setError] = React.useState(false)
   const [LQIPimageUrl, setLQIPimageUrl] = React.useState(lowSizeBGImage)
   const [LQIPerror, setLQIPError] = React.useState(false)
   const [LQIPdisplay, setLQIPdisplay] = React.useState('unset')
   const mainImageRef = React.useRef()

   React.useEffect(() => {
      if (src !== finalImageSrc) {
         const node = mainImageRef.current
         if (node?.className) {
            node.className = `lazyload ${className}`
         }
         setSrc(finalImageSrc)
      }
   }, [dataSrc])

   const SERVER_URL = React.useMemo(() => {
      const storeMode = process?.env?.NEXT_PUBLIC_MODE || 'production'
      if (isClient) {
         return {
            production: window.location.origin,
            'full-dev': 'http://localhost:4000',
            'store-dev': 'http://localhost:4000',
         }[storeMode]
      } else {
         return null
      }
   }, [isClient])
   if (!(width && height) && !removeBg) {
      return (
         <img
            className={`lazyload ${className}`}
            data-src={dataSrc}
            style={style}
            {...rest}
         />
      )
   }

   // removing data-src from rest bcz data-src using dynamically by state
   return (
      <div className="hern-image__image-container">
         <img
            className={`lazyload ${className} hern-LQIP-image`}
            data-src={LQIPimageUrl}
            onError={async ({ currentTarget }) => {
               if (!LQIPerror) {
                  // changing class to lazyloding to lazyload so that lazysizes reload the new image
                  currentTarget.className = currentTarget.className.replace(
                     'lazyloading',
                     'lazyload'
                  )
                  const LQIPfallbackUrl = `${SERVER_URL}/server/api/assets/serve-image?width=${lowImageSizeWidth}&height=${lowImageSizeHeight}&src=${dataSrc}`
                  setLQIPimageUrl(LQIPfallbackUrl)
                  setLQIPError(true)
               }
            }}
            style={{ display: LQIPdisplay }}
         />
         <img
            ref={mainImageRef}
            className={`lazyload ${className}`}
            data-src={src}
            // src={src}
            style={{
               ...style,
            }}
            onLoad={() => {
               setLQIPdisplay('none')
            }}
            onError={async ({ currentTarget }) => {
               if (!error) {
                  // changing class to lazyloding to lazyload so that lazysizes reload the new image
                  currentTarget.className = currentTarget.className.replace(
                     'lazyloading',
                     'lazyload'
                  )
                  if (removeBg && !(Boolean(width) && Boolean(height))) {
                     // remove only background
                     const fallbackImageUrl = `${SERVER_URL}/server/api/assets/serve-image?removebg=true&src=${dataSrc}`
                     // const imageData = await axios.get(fallbackImageUrl)
                     setSrc(fallbackImageUrl)
                  } else if (!removeBg && Boolean(width) && Boolean(height)) {
                     // resize image only
                     const fallbackImageUrl = `${SERVER_URL}/server/api/assets/serve-image?width=${width}&height=${height}&src=${dataSrc}`
                     // const imageData = await axios.get(fallbackImageUrl)
                     setSrc(fallbackImageUrl)
                  } else if (removeBg && Boolean(width) && Boolean(height)) {
                     // remove background and resize image
                     const fallbackImageUrl = `${SERVER_URL}/server/api/assets/serve-image?width=${width}&height=${height}&src=${dataSrc}&removebg=true`
                     // const imageData = await axios.get(fallbackImageUrl)
                     setSrc(fallbackImageUrl)
                  }
                  setError(true)
               }
            }}
            {...rest}
         />
      </div>
   )
}
