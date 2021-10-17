import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { StyledDiv, CategoryWiseDiv } from './styled'
import { isEmpty, useWindowDimensions } from '../../utils'
import Carousel from '../Carousel'
import Masonry from '../Masonry'
import { Card } from '../Card'
const breakpointColumnsObj = {
   default: 4,
   1100: 3,
   700: 2,
   500: 1
}

const CategoryWise = ({
   data,
   type,
   componentLayout = 'masonry',
   keyname = 'experience_experienceCategories',
   showWishlist,
   categoryTitleClass = ''
}) => {
   const router = useRouter()
   return (
      <>
         {componentLayout === 'carousel' && (
            <>
               {!isEmpty(data) &&
                  data.map(category => {
                     return (
                        <CategoryWiseDiv key={category?.title}>
                           <h3 className="category__title text8">
                              {category?.title || 'N/A'}
                           </h3>
                           <Carousel
                              data={category[keyname] || []}
                              type={type}
                              showWishlist={showWishlist}
                           />
                        </CategoryWiseDiv>
                     )
                  })}
            </>
         )}
         {componentLayout === 'masonry' && (
            <>
               {!isEmpty(data) &&
                  data.map(category => {
                     return (
                        <CategoryWiseDiv key={category?.title}>
                           <h3
                              className={`category__title text3 ${categoryTitleClass}`}
                           >
                              {category?.title || 'N/A'}
                           </h3>
                           <Masonry
                              breakpointCols={breakpointColumnsObj}
                              className="my-masonry-grid"
                              columnClassName="my-masonry-grid_column"
                           >
                              {category[keyname].map((item, index) => {
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
                           </Masonry>
                        </CategoryWiseDiv>
                     )
                  })}
            </>
         )}
      </>
   )
}

export default function RenderCard({
   data = [],
   type = 'experience',
   layout = 'carousel',
   showCategorywise = true,
   showWishlist = true,
   keyname = 'experience_experienceCategories',
   categoryTitleClass = ''
}) {
   const [componentLayout, setComponentLayout] = useState(layout)
   const { width } = useWindowDimensions()
   const router = useRouter()
   useEffect(() => {
      if (layout !== 'masonry') {
         if (width < 770) {
            setComponentLayout('masonry')
         } else {
            setComponentLayout(layout)
         }
      }
   }, [layout, width])
   return (
      <StyledDiv>
         {componentLayout === 'carousel' && (
            <>
               {showCategorywise ? (
                  <CategoryWise
                     data={data}
                     type={type}
                     componentLayout={componentLayout}
                     keyname={keyname}
                     showWishlist={showWishlist}
                     categoryTitleClass={categoryTitleClass}
                  />
               ) : (
                  <Carousel
                     data={data}
                     type={type}
                     showWishlist={showWishlist}
                  />
               )}
            </>
         )}
         {componentLayout === 'masonry' && (
            <>
               {showCategorywise ? (
                  <CategoryWise
                     data={data}
                     type={type}
                     componentLayout={componentLayout}
                     keyname={keyname}
                     showWishlist={showWishlist}
                     categoryTitleClass={categoryTitleClass}
                  />
               ) : (
                  <Masonry
                     breakpointCols={breakpointColumnsObj}
                     className="my-masonry-grid"
                     columnClassName="my-masonry-grid_column"
                  >
                     {data.map((item, index) => {
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
                  </Masonry>
               )}
            </>
         )}
      </StyledDiv>
   )
}
