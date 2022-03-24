import React from 'react'
import { FaQuoteLeft } from 'react-icons/fa'
import { BiChevronRight, BiChevronLeft } from 'react-icons/bi'
import { Carousel } from 'antd'
import { HernLazyImage } from '../../utils/hernImage'
import { isClient } from '../../utils'

export const Testimonials = ({ config }) => {
   const content = config.display.review.content
   const carouselRef = React.createRef()
   const testimonialImageSize = React.useMemo(() => {
      const innerWidth = isClient ? window.innerWidth : ''
      if (0 <= innerWidth && innerWidth <= 468) {
         return {
            width: 120,
            height: 160,
         }
      } else if (469 <= innerWidth && innerWidth <= 900) {
         return {
            width: 120,
            height: 160,
         }
      } else if (901 <= innerWidth) {
         return {
            width: 103,
            height: 193,
         }
      }
   }, [])
   return (
      <div className="hern-testimonials">
         <Carousel ref={carouselRef} dots={false}>
            {content.map(({ userName, img, review, location }) => (
               <div>
                  <div className="hern-testimonials__wrapper">
                     <span
                        className="hern-testimonials__arrow-left"
                        role="button"
                        onClick={() => carouselRef.current.prev()}
                     >
                        <BiChevronLeft color="#fff" size={20} />
                     </span>
                     <div className="hern-testimonials__image">
                        <HernLazyImage
                           dataSrc={img}
                           alt={userName}
                           width={testimonialImageSize.width}
                           height={testimonialImageSize.height}
                        />
                     </div>
                     <div className="hern-testimonials__content">
                        <span>
                           <FaQuoteLeft color="#fff" />
                        </span>
                        <p>{review}</p>
                        <h4>
                           {userName}&nbsp; | &nbsp; <span>{location}</span>
                        </h4>
                     </div>
                     <span
                        className="hern-testimonials__arrow-right"
                        role="button"
                        onClick={() => carouselRef.current.next()}
                     >
                        <BiChevronRight color="#fff" size={20} />
                     </span>
                  </div>
               </div>
            ))}
         </Carousel>
      </div>
   )
}
