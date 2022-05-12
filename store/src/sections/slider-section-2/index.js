import React from 'react'
import { Carousel } from 'antd'
import { ArrowLeftIcon, ArrowRightIcon } from '../../assets/icons'
import { HernLazyImage } from '../../utils/hernImage'
import { config } from 'bluebird'
import { isClient } from '../../utils'

export const SliderSection2 = ({ config }) => {
   const showDotsOnSlider =
      config?.informationVisibility?.dotsOnSlider?.value ?? false
   const showArrowsOnSlider =
      config?.informationVisibility?.sliderArrow?.value ?? false
   const sliderImages = config?.display?.images?.value?.url ?? false
   return (
      <div
         class="slider-section-2"
         style={
            config?.display?.bgImage?.value
               ? {
                    backgroundImage: `url('${config?.display?.bgImage?.value}')`,
                 }
               : {}
         }
      >
         {config?.informationVisibility?.separator?.value && (
            <div
               class="separator"
               style={{
                  backgroundColor:
                     config?.display?.separatorColor?.value ||
                     'var(--hern-accent)',
               }}
            ></div>
         )}
         {config?.informationVisibility?.heading?.value && (
            <p class="heading">{config?.display?.heading?.value}</p>
         )}
         {sliderImages && (
            <Carousel
               className="hern-slider_section2-carousel"
               arrows={showArrowsOnSlider}
               dots={
                  showDotsOnSlider
                     ? { className: 'hern-slider_section2-carousel-dots' }
                     : false
               }
               prevArrow={
                  showArrowsOnSlider ? <LeftArrow config={config} /> : false
               }
               nextArrow={
                  showArrowsOnSlider ? <RightArrow config={config} /> : false
               }
               slidesToShow={
                  config?.informationVisibility?.slidesToShow?.value ||
                  config?.informationVisibility?.slidesToShow?.default ||
                  1
               }
               infinite={config?.informationVisibility?.infiniteScroll?.value}
               centerMode={true}
               responsive={[
                  {
                     breakpoint: 768,
                     settings: {
                        slidesToShow: 1,
                     },
                  },
                  {
                     breakpoint: 599,
                     settings: {
                        slidesToShow: 1,
                     },
                  },
                  {
                     breakpoint: 480,
                     settings: {
                        slidesToShow: 1,
                     },
                  },
               ]}
            >
               {sliderImages &&
                  sliderImages.map((imageSrc, index) => {
                     return <SliderDiv images={sliderImages} index={index} />
                  })}
            </Carousel>
         )}
      </div>
   )
}

const SliderDiv = ({ images, index }) => {
   const sliderImageSize = React.useMemo(() => {
      const innerWidth = isClient ? window.innerWidth : ''
      if (0 <= innerWidth && innerWidth <= 599) {
         return {
            width: 220,
            height: 260,
         }
      } else if (600 <= innerWidth && innerWidth <= 1024) {
         return {
            width: 250,
            height: 340,
         }
      } else if (1024 <= innerWidth) {
         return {
            width: 360,
            height: 480,
         }
      }
   }, [])
   return (
      <div className="slider-div">
         <HernLazyImage
            className="slider-img"
            dataSrc={images[index] ? images[index] : ''}
            width={sliderImageSize.width}
            height={sliderImageSize.height}
         />
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
