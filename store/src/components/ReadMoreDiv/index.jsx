import React, { useState, useEffect, useRef } from 'react'
import { Wrapper } from './styles'

const ReadMoreDiv = ({ children }) => {
   const infoDivRef = useRef()
   const [isReadingMore, setIsReadingMore] = useState(false)

   useEffect(() => {
      let height = infoDivRef.current.scrollHeight
      if (isReadingMore) {
         infoDivRef.current.style.height = `${height}px`
      } else {
         infoDivRef.current.style.height = '25px'
      }
   }, [isReadingMore])

   return (
      <Wrapper>
         <div>
            <div ref={infoDivRef} className="info-div">
               {children}
            </div>
            {/* show the read more button if it has the much content to be read
      i.e when it doesn't fit in the given height of the div */}
            {infoDivRef.current && infoDivRef.current.scrollHeight > 50 && (
               <button
                  className="read-more-btn text8"
                  onClick={() => setIsReadingMore(prev => !prev)}
               >
                  {isReadingMore ? 'Read Less' : 'Read More'}
               </button>
            )}
         </div>
      </Wrapper>
   )
}
export default ReadMoreDiv
