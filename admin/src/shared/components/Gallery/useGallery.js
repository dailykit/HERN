import { useState, useEffect } from 'react'

export default function useCarousel(list) {
   console.log(list)
   const [images, setImages] = useState(list)
   const [current, setCurrent] = useState(0)

   useEffect(() => {
      if (Array.isArray(list)) {
         setImages(list)
      }
   }, [list])

   const setActive = index => {
      if (index > images.length - 1 || index < 0) {
         setCurrent(0)
      } else {
         setCurrent(index)
      }
   }

   const addImage = url => {
      const updatedImages = [...images, url]
      setImages(updatedImages)
      return updatedImages
   }
   const removeImage = id => {
      const prevData = images
      const updatedImages = prevData.filter((img, index) => {
         return index !== id
      })
      setImages(updatedImages)
      setCurrent(0)
      return updatedImages
   }
   const editImage = (url, id) => {
      const prevData = images
      prevData[id] = url
      const updatedImages = prevData
      setImages(updatedImages)
      return updatedImages
   }

   return {
      current,
      setActive,
      addImage,
      removeImage,
      editImage,
      images,
   }
}
