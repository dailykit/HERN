import React from 'react'
import { FaQuoteLeft, FaQuoteRight } from 'react-icons/fa'
import { BiChevronRight, BiChevronLeft } from 'react-icons/bi'
import { Carousel } from 'antd'
import { HernLazyImage } from '../../utils/hernImage'
import { isClient } from '../../utils'

export const Testimonials = ({ config }) => {
   const content = config.display.review.content
   const variant = config?.display?.variant?.value?.value
   const header = config?.data?.title?.value
   const subHeading = config?.data?.subTitle?.value

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
      <div className="hern-testimonials__container">
         {(!variant || variant === 'slider-with-image') && (
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
                              <HernLazyImage dataSrc={img} alt={userName} />
                           </div>
                           <div className="hern-testimonials__content">
                              <span>
                                 <FaQuoteLeft color="#fff" />
                              </span>
                              <p>{review}</p>
                              <h4>
                                 {userName}&nbsp; | &nbsp;{' '}
                                 <span>{location}</span>
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
         )}

         {variant === 'slider-without-image' && (
            <div
               style={{
                  backgroundImage: `url('${config.data.backgroundImage.value}')`,
               }}
               className="hern-testimonials--without-image"
            >
               <div className="hern-testimonials__header">
                  <span style={{ background: '#fe8b76' }}></span>
                  <h3>{header}</h3>
               </div>
               <div className="hern-testimonials--without-image__reviews">
                  <Carousel ref={carouselRef} dots={{ className: 'pink-dots' }}>
                     {content.map(({ userName, review }) => (
                        <div class="hern-testimonials--without-image__review_container">
                           <div
                              className="hern-testimonials--without-image__review"
                              style={{ borderColor: '#fe8b76' }}
                           >
                              <div style={{ marginBottom: '24px' }}>
                                 <svg
                                    width="61"
                                    height="61"
                                    viewBox="0 0 61 61"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                 >
                                    <path
                                       d="M0.103333 30.8994V60.8994H25.8177V30.8994H8.67482C8.67482 19.8717 16.3653 10.8995 25.8177 10.8995V0.899414C11.6379 0.899414 0.103333 14.3564 0.103333 30.8994Z"
                                       fill="#FE8B76"
                                    />
                                    <path
                                       d="M60.1033 10.8995V0.899414C45.9236 0.899414 34.389 14.3564 34.389 30.8994V60.8994H60.1033V30.8994H42.9605C42.9605 19.8717 50.651 10.8995 60.1033 10.8995Z"
                                       fill="#FE8B76"
                                    />
                                 </svg>
                              </div>
                              <div>
                                 <p className="hern-testimonials--without-image__review__content">
                                    {review}
                                 </p>
                                 <h4 className="hern-testimonials--without-image__review__user">
                                    {userName}
                                 </h4>
                              </div>
                           </div>
                        </div>
                     ))}
                  </Carousel>
                  <span className="hern-testimonials--without-image__review__quote">
                     <svg
                        width="241"
                        height="241"
                        viewBox="0 0 241 241"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                     >
                        <path
                           d="M240.636 120.012V240.012H137.779V120.012H206.35C206.35 75.9012 175.588 40.0124 137.779 40.0124V0.012207C194.498 0.012207 240.636 53.8402 240.636 120.012Z"
                           fill="#FFB5A1"
                           fill-opacity="0.25"
                        />
                        <path
                           d="M0.636108 40.0124V0.012207C57.355 0.012207 103.493 53.8402 103.493 120.012V240.012H0.636108V120.012H69.2075C69.2075 75.9012 38.4456 40.0124 0.636108 40.0124Z"
                           fill="#FFB5A1"
                           fill-opacity="0.25"
                        />
                     </svg>
                  </span>
               </div>
            </div>
         )}

         {variant === 'slider-without-image-center-aligned' && (
            <div
               style={{
                  backgroundImage: `url('${config.data.backgroundImage.value}')`,
               }}
               className="hern-testimonials--without-image hern-testimonials--without-image-center-aligned"
            >
               <div className="hern-testimonials__header">
                  <span style={{ background: '#AEE57A' }}></span>
                  <h3>{header}</h3>
                  {subHeading && <h6>{subHeading}</h6>}
               </div>
               <div className="hern-testimonials--without-image__reviews">
                  <Carousel
                     ref={carouselRef}
                     dots={{ className: 'green-dots' }}
                     slidesToShow={3}
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
                     {content.map(({ userName, review }) => (
                        <div className="hern-testimonials--without-image__review_container">
                           <div
                              className="hern-testimonials--without-image__review"
                              style={{
                                 border: 'none',
                                 backgroundColor: '#AEE57A',
                                 textAlign: 'center',
                              }}
                           >
                              <div
                                 style={{
                                    marginBottom: '24px',
                                    display: 'flex',
                                    justifyContent: 'center',
                                 }}
                              >
                                 <svg
                                    width="61"
                                    height="61"
                                    viewBox="0 0 61 61"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                 >
                                    <path
                                       d="M0.103333 30.8994V60.8994H25.8177V30.8994H8.67482C8.67482 19.8717 16.3653 10.8995 25.8177 10.8995V0.899414C11.6379 0.899414 0.103333 14.3564 0.103333 30.8994Z"
                                       fill="#fff"
                                    />
                                    <path
                                       d="M60.1033 10.8995V0.899414C45.9236 0.899414 34.389 14.3564 34.389 30.8994V60.8994H60.1033V30.8994H42.9605C42.9605 19.8717 50.651 10.8995 60.1033 10.8995Z"
                                       fill="#fff"
                                    />
                                 </svg>
                              </div>
                              <div>
                                 <p className="hern-testimonials--without-image__review__content">
                                    {review}
                                 </p>
                                 <h4 className="hern-testimonials--without-image__review__user">
                                    {userName}
                                 </h4>
                              </div>
                           </div>
                        </div>
                     ))}
                  </Carousel>
               </div>
            </div>
         )}
      </div>
   )
}
