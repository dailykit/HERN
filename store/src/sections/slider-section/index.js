import React from 'react'
import { Carousel } from 'antd'
import dynamic from 'next/dynamic'
import { ArrowLeftIcon, ArrowRightIcon } from '../../assets/icons'
// import { HernLazyImage } from '../../utils/hernImage'
import { isClient, useWindowOnload } from '../../utils'

const HernLazyImage = dynamic(() =>
   import('../../utils/hernImage').then(promise => promise.HernLazyImage)
)
import Link from 'next/link'

export const SliderSection = ({ config }) => {
   const sliderConfig = {
      autoPlay: config?.autoPlay?.value,
      showArrow: config?.showArrow?.value,
      showDots: config?.showDots?.value,
      content: config?.sliderContent?.value.map(slider => {
         return {
            image: slider.find(item => item.filedKey === 'sliderImage').value,
            video: slider.find(item => item.filedKey === 'sliderVideo').value,
            description: slider.find(
               item => item.filedKey === 'sliderDescription'
            ).value,
            title: slider.find(item => item.filedKey === 'sliderTitle').value,
            showCallToActionButton: slider.find(
               item => item.filedKey === 'showSliderCTAButton'
            ).value,
            callToActionButtonLabel: slider.find(
               item => item.filedKey === 'sliderCTAButtonLabel'
            ).value,
            callToActionButtonLink: slider.find(
               item => item.filedKey === 'sliderCTAButtonLink'
            ).value,
         }
      }),
   }
   const { isWindowLoading } = useWindowOnload()
   return (
      <div
         style={{
            width: '100%',
            minHeight: 'calc(100vw / 2 )',
            position: 'relative',
         }}
      >
         <div className="hern-slider-section-overlay"></div>
         {sliderConfig.content && (
            <Carousel
               className="hern-slider_section-carousel"
               arrows={sliderConfig.showArrow}
               dots={sliderConfig.showDots}
               prevArrow={sliderConfig.showArrow ? <LeftArrow /> : false}
               nextArrow={sliderConfig.showArrow ? <RightArrow /> : false}
               autoplay={!isWindowLoading && sliderConfig.autoPlay}
            >
               {sliderConfig.content.length > 0 &&
                  sliderConfig.content.map((content, index) => {
                     return <SliderDiv content={content} key={index} />
                  })}
            </Carousel>
         )}
      </div>
   )
}

const SliderDiv = ({ content }) => {
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
            dataSrc={content.image}
            width={sliderImageSize.width}
            height={sliderImageSize.height}
            className="hern-slider_section-image"
            // alt="products"
            // width="100%"
         />
         {/* <video muted autoplay="autoplay" loop="loop" preload="auto">
                <source src={content.video.value[index]?content.video.value[index]:content.video.default}></source>
            </video> */}
         <div className="hern-slider-section__content">
            <div>
               <h1 className="hern-slider_section-heading">{content.title}</h1>
               <p className="hern-slider_section-description">
                  {content.description}
               </p>
               <Link
                  href={content.callToActionButtonLink}
                  className="hern-slider_section-get_started_button"
               >
                  Get Started
               </Link>
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

// const FeedBackFormButton = () => {
//    return (
//       <div>
//          {/* <div className="hern-slider-section__content"> */}
//          <div>
//             <a
//                href="https://docs.google.com/forms/d/e/1FAIpQLSec10yg1m1RlikaVXPWALWmsXqrWJGYMyEUj8Bp2KMn2DyS3Q/viewform"
//                className="hern-slider_section-feedBack_button"
//                // style={{}}
//             >
//                {' '}
//                Feedback
//             </a>
//             {/* </div> */}
//          </div>
//       </div>
//    )
// }
