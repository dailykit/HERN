import React from 'react'
import axios from 'axios'

const url = `${window.location.origin}/server/api/assets`

const useAssets = type => {
   const [images, setImages] = React.useState([])
   const [videos, setVideos] = React.useState([])
   const [misc, setMisc] = React.useState([])
   const [error, setError] = React.useState('')
   const [status, setStatus] = React.useState('LOADING')

   React.useEffect(() => {
      ;(async () => {
         try {
            const { data } = await axios.get(`${url}?type=${type}`)
            setStatus('SUCCESS')
            switch (type) {
               case 'images':
                  return setImages(data.data)
               case 'videos':
                  return setVideos(data.data)
               case 'misc':
                  return setMisc(data.data)
               default:
                  throw Error('Unknown File Type')
            }
         } catch (err) {
            setStatus('ERROR')
            setError(err.message)
         }
      })()
   }, [type])

   const upload = async ({ files }) => {
      const formData = new FormData()
      files.forEach(({ raw }, index) => {
         formData.append(index, raw)
      })
      const { data } = await axios.post(url, formData, {
         headers: {
            'Content-Type': 'multipart/form-data',
         },
      })
      if (Array.isArray(data) && data.length > 0) {
         return data
      }
      return []
   }

   const remove = async key => {
      const { data } = await axios.delete(url, {
         params: { key },
      })
      if (data.success) {
         setImages(images.filter(image => image.key !== key))
      }
   }

   return { status, misc, images, videos, error, remove, upload }
}

export default useAssets
