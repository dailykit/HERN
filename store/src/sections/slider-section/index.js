import React from 'react'
import { Carousel } from 'antd'
import { ArrowLeftIcon, ArrowRightIcon } from '../../assets/icons'
import { HernLazyImage } from '../../utils/hernImage'
import { isClient } from '../../utils'

export const SliderSection = ({ config }) => {
   const showDotsOnSlider =
      config?.display?.slider?.showDotsOnSilder?.value ?? false
   const showArrowsOnSlider =
      config?.display?.slider?.showSliderArrow?.value ?? false
   const sliderContent = config.display.slider.content.images.value ?? false
   const getStartedURL = config?.data?.callToActionButtonURL.value ?? '#'
   return (
      <>
         {sliderContent && (
            <Carousel
               className="hern-slider_section-carousel"
               arrows={showArrowsOnSlider}
               dots={showDotsOnSlider}
               prevArrow={showArrowsOnSlider ? <LeftArrow /> : false}
               nextArrow={showArrowsOnSlider ? <RightArrow /> : false}
               autoplay={true}
            >
               {sliderContent &&
                  config.display.slider.content.images.value.map(
                     (imageSrc, index) => {
                        return (
                           <SliderDiv
                              content={config.display.slider.content}
                              index={index}
                              getStartedURL={getStartedURL}
                              key={imageSrc}
                           />
                        )
                     }
                  )}
            </Carousel>
         )}
      </>
   )
}

const SliderDiv = ({ content, index, getStartedURL }) => {
   if (!isClient) {
      return null
   }
   const sliderImageSize = React.useMemo(() => {
      const innerWidth = isClient ? window.innerWidth : ''
      if (0 < innerWidth && innerWidth <= 468) {
         return {
            width: innerWidth,
            height: innerWidth / 2,
         }
      } else if (469 <= innerWidth && innerWidth <= 900) {
         return {
            width: innerWidth,
            height: innerWidth / 2,
         }
      } else if (901 <= innerWidth) {
         return {
            width: innerWidth,
            height: innerWidth / 2,
         }
      } else {
         return {
            width: null,
            height: null,
         }
      }
   }, [isClient])
   return (
      <div
         style={{
            position: 'relative',
         }}
      >
         <HernLazyImage
            dataSrc={
               content.images.value[index]
                  ? content.images.value[index]
                  : content.images.default
            }
            width={sliderImageSize.width}
            height={sliderImageSize.height}
            // alt="products"
            // width="100%"
         />
         {/* <video muted autoplay="autoplay" loop="loop" preload="auto">
                <source src={content.video.value[index]?content.video.value[index]:content.video.default}></source>
            </video> */}
         <div className="hern-slider-section__content">
            <div>
               <h1 className="hern-slider_section-heading">
                  {content.heading.value[index]
                     ? content.heading.value[index]
                     : content.heading.default}
               </h1>
               <p className="hern-slider_section-description">
                  {content.description.value[index]
                     ? content.description.value[index]
                     : content.description.default}
               </p>
               <a
                  href={getStartedURL}
                  className="hern-slider_section-get_started_button"
               >
                  Get Started
               </a>
            </div>
         </div>
      </div>
   )
}

const LeftArrow = ({ ...props }) => {
   return (
      <div {...props} className="hern-slider_section-left_arrow">
         <ArrowLeftIcon color="black" size="35" />
      </div>
   )
}

const RightArrow = ({ ...props }) => {
   return (
      <div {...props} className="hern-slider_section-right_arrow">
         <ArrowRightIcon color="black" size="35" />
      </div>
   )
}
