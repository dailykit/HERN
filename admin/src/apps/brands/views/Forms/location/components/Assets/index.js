import { useMutation } from '@apollo/react-hooks'
import { Flex } from '@dailykit/ui'
import React from 'react'
import { toast } from 'react-toastify'
import { Gallery } from '../../../../../../../shared/components'
import { logger } from '../../../../../../../shared/utils'
import { LOCATIONS } from '../../../../../graphql'

export const Assets = ({ state, locationId }) => {
   const [updateLocation] = useMutation(LOCATIONS.UPDATE, {
      onCompleted: () => {
         toast.success('Image updated!')
      },
      onError: error => {
         toast.error('Something went wrong!')
         logger(error)
      },
   })

   const addImage = image => {
      updateLocation({
         variables: {
            id: locationId,
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
      <Flex
         width="50%"
         style={{ position: 'relative', top: '24px' }}
         title={'Add a Image'}
      >
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
