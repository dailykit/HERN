import React from 'react'
import { Carousel } from 'antd'
import { ArrowLeftIcon, ArrowRightIcon } from '../../assets/icons'

export const SliderSection = ({ config }) => {
   const showDotsOnSlider =
      config?.display?.slider?.showDotsOnSilder?.value ?? false
   const showArrowsOnSlider =
      config?.display?.slider?.showSliderArrow?.value ?? false
   const sliderContent = config.display.slider.content.images.value ?? false
   const getStartedURL =
      config?.data?.getStartedURL.value ??
      'https://chefbaskit1.dailykit.org/order'
   return (
      <>
         {sliderContent && (
            <Carousel
               className="hern-slider_section-carousel"
               arrows
               dots={showDotsOnSlider}
               prevArrow={showArrowsOnSlider ? <LeftArrow /> : false}
               nextArrow={showArrowsOnSlider ? <RightArrow /> : false}
            >
               {sliderContent &&
                  config.display.slider.content.images.value.map(
                     (imageSrc, index) => {
                        return (
                           <SliderDiv
                              content={config.display.slider.content}
                              index={index}
                              getStartedURL={getStartedURL}
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
   return (
      <div>
         <div
            style={{
               display: 'flex',
               alignItems: 'center',
               justifyContent: 'center',
            }}
         >
            <img
               src={
                  content.images.value[index]
                     ? content.images.value[index]
                     : content.images.default
               }
               alt="products"
               width="100%"
            />
            {/* <video muted autoplay="autoplay" loop="loop" preload="auto">
                <source src={content.video.value[index]?content.video.value[index]:content.video.default}></source>
            </video> */}
            <div
               style={{
                  position: 'absolute',
                  color: 'white',
                  width: '10%',
                  textAlign: 'center',
               }}
            >
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