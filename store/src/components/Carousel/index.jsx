import React from 'react'
import { CarouselWrapper } from './styled'
import { Card } from '../Card'
import { isEmpty } from '../../utils'
import 'slick-carousel/slick/slick.css'
import 'slick-carousel/slick/slick-theme.css'

const Carousel = ({ data = [], type = 'experience', showWishlist = true }) => {
   const settings = {
      dots: true,
      speed: 500,
      slidesToShow: 3,
      slidesToScroll: 3,
      arrows: false,
      infinite: true,
      appendDots: dots => <ul>{dots}</ul>,
      responsive: [
         {
            breakpoint: 769,
            settings: {
               slidesToShow: 1,
               slidesToScroll: 1,
               dots: false,
               arrows: false
            }
         }
      ]
   }
   return (
      <CarouselWrapper {...settings}>
         {!isEmpty(data) &&
            data.map((item, index) => {
               return (
                  <Card
                     boxShadow={false}
                     key={index}
                     type={type}
                     data={item}
                     showWishlist={showWishlist}
                  />
               )
            })}
      </CarouselWrapper>
   )
}
export default Carousel
