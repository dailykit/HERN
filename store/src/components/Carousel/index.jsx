import React, { useRef } from 'react'
import { useRouter } from 'next/router'
import dynamic from 'next/dynamic'
import 'owl.carousel/dist/assets/owl.carousel.css'
import 'owl.carousel/dist/assets/owl.theme.default.css'
import { StyledDiv } from './styled'
import { ChevronLeft, ChevronRight } from '../Icons'
import Card from '../Card'
import { theme } from '../../theme'
const OwlCarousel = dynamic(import('react-owl-carousel'), {
   ssr: false
})

const Carousel = ({ data }) => {
   console.log({ data })
   const owlCarouselRef = useRef()
   const router = useRouter()
   return (
      <StyledDiv>
         <div className="prev_btn">
            <span onClick={() => owlCarouselRef.current.prev()}>
               <ChevronLeft size={28} color={theme.colors.textColor7} />
            </span>
         </div>
         <OwlCarousel
            onInitialize={carousel => {
               owlCarouselRef.current = carousel.relatedTarget
            }}
            className="owl-theme"
            items={3}
            loop={false}
            margin={16}
            nav={false}
            dots={false}
         >
            {data &&
               data.length &&
               data.map((item, index) => {
                  return (
                     <div class="item" key={item?.experience?.id}>
                        <Card
                           onClick={() =>
                              router.push(
                                 `/experiences/${item?.experience?.id}`
                              )
                           }
                           boxShadow="true"
                           key={index}
                           type="experience"
                           data={item}
                        />
                        {/* <img src={item} alt="img" /> */}
                     </div>
                  )
               })}
         </OwlCarousel>
         <div className="next_btn">
            <span onClick={() => owlCarouselRef.current.next()}>
               <ChevronRight size={28} color={theme.colors.textColor7} />
            </span>
         </div>
      </StyledDiv>
   )
}
export default Carousel
