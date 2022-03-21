import React from 'react'
import { Carousel } from 'antd'
import { ArrowLeftIcon, ArrowRightIcon } from '../../assets/icons'
import { HernLazyImage } from '../../utils/hernImage'
import { config } from 'bluebird'

export const SliderSection2 = ({ config }) => {
   const showDotsOnSlider =
      config?.informationVisibility?.dotsOnSilder?.value ?? false
   const showArrowsOnSlider =
      config?.informationVisibility?.sliderArrow?.value ?? false
   const sliderImages = config?.display?.images.value ?? false
   return (
      <div class="slider-section-2">
         {config?.informationVisibility?.saperator?.value && (
            <div class="separator"></div>
         )}
         {config?.informationVisibility?.saperator?.value && (
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
                     return (
                        <SliderDiv
                           images={config.display.images}
                           index={index}
                        />
                     )
                  })}
            </Carousel>
         )}
      </div>
   )
}

const SliderDiv = ({ images, index }) => {
   return (
      <div class="slider-div">
         <img
            class="slider-img"
            src={images.value[index] ? images.value[index] : ''}
         />
      </div>
   )
}

const LeftArrow = ({ ...props }) => {
   return (
      <div {...props} className="hern-slider_section-left_arrow">
         <ArrowLeftIcon
            style={{
               backgroundColor: props?.config?.theam?.brandColor,
               color: '#fff',
            }}
            size="35"
         />
      </div>
   )
}

const RightArrow = ({ ...props }) => {
   return (
      <div {...props} className="hern-slider_section-right_arrow">
         <ArrowRightIcon
            style={{
               backgroundColor: props?.config?.theam?.brandColor,
               color: '#fff',
            }}
            size="35"
         />
      </div>
   )
}
