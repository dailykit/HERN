import React from 'react'
import { useMutation } from '@apollo/react-hooks'
import { useTunnel, Flex } from '@dailykit/ui'
import { toast } from 'react-toastify'
import { logger } from '../../../../../../../shared/utils'
import { PRODUCT } from '../../../../../graphql'
import { Gallery } from '../../../../../../../shared/components'

const Assets = ({ state }) => {
   const [updateProduct] = useMutation(PRODUCT.UPDATE, {
      onCompleted: () => {
         toast.success('Image updated!')
      },
      onError: error => {
         toast.error('Something went wrong!')
         logger(error)
      },
   })

   const addImage = image => {
      updateProduct({
         variables: {
            id: state.id,
            _set: {
               assets: {
                  images: image,
                  videos: [],
               },
            },
         },
      })
   }

   return (
      <Flex width="100%">
         {state?.assets?.images != null && state?.assets?.images?.length ? (
            <Gallery
               list={state.assets.images}
               isMulti={true}
               onChange={images => {
                  addImage(images)
               }}
            />
         ) : (
            <Gallery
               list={[]}
               isMulti={true}
               onChange={images => {
                  addImage(images)
               }}
            />
         )}
      </Flex>
   )
}

export default Assets
