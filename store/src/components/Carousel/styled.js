import dynamic from 'next/dynamic'
import styled from 'styled-components'
import Slider from 'react-slick'

export const CarouselWrapper = styled(Slider)`
   :hover {
      .slick-next,
      .slick-prev {
         display: block !important;
      }
   }
   .text {
      position: absolute;
      top: 20%;
      left: 6rem;
      z-index: 5;
      color: #fff;
   }
   .slick-slide {
      margin: 0 18px;
      width: 300px !important;
   }
   /* the parent */
   .slick-list {
      margin: 0 -24px;
   }
   .slick-next,
   .slick-prev {
      display: none !important;
      ::before {
         content: none !important;
      }
   }
   .item {
      width: 100%;
      height: 480px;
      position: relative;
   }

   .item img {
      width: 100%;
      height: 100%;
      object-fit: cover;
   }
   ul {
      list-style: none;
   }
   ul li {
      margin: 0 8px;
      width: 12px;
      height: 12px;
      background: #fff;
      border-radius: 50%;
   }
   ul li button::before {
      content: none !important;
      opacity: unset;
      color: unset;
   }
   ul li.slick-active button::before {
      content: none !important;
      opacity: unset;
      color: unset;
   }
   ul li.slick-active {
      background: #dc2047 !important;
   }
`
