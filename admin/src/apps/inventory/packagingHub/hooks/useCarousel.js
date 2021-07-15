import { useState, useEffect } from 'react'

export default function useCarousel(list) {
   const [data, setData] = useState([])
   const [current, setCurrent] = useState(0)

   useEffect(() => {
      if (Array.isArray(list)) setData(list)
   }, [list])

   const setActive = index => {
      if (index > data.length - 1 || index < 0) return

      setCurrent(index)
   }

   const next = () => {
      if (current === data.length - 1) setCurrent(0)
      else setCurrent(current + 1)
   }

   const previous = () => {
      if (current === 0) setCurrent(data.length - 1)
      else setCurrent(current - 1)
   }

   return { current, previous, next, setActive }
}
