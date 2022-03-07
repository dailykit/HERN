import { React } from 'react'
import ReactImageFallback from 'react-image-fallback'
import { get_env } from './get_env'
import 'lazysizes'
import 'lazysizes/plugins/parent-fit/ls.parent-fit'

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

export const HernLazyImage = ({ className = '', ...rest }) => {
   return <img className={`lazyload ${className}`} {...rest} />
}
