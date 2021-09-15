import React from 'react'
import { useMutation } from '@apollo/react-hooks'
import { ButtonTile, Flex, Tunnel, Tunnels, useTunnel } from '@dailykit/ui'
import { toast } from 'react-toastify'
import { logger } from '../../../../../../../shared/utils'
import { DeleteIcon, EditIcon } from '../../../../../assets/icons'
import { UPDATE_RECIPE } from '../../../../../graphql'
import { PhotoTunnel } from '../../tunnels'
import { ImageContainer, PhotoTileWrapper } from './styled'
import { Gallery } from '../../../../../../../shared/components'

const Photo = ({ state }) => {
   const [tunnels, openTunnel, closeTunnel] = useTunnel(1)

   const [updateRecipe] = useMutation(UPDATE_RECIPE, {
      onCompleted: () => {
         toast.success('Image updated!')
      },
      onError: error => {
         toast.error('Something went wrong!')
         logger(error)
      },
   })

   const addImage = images => {
      updateRecipe({
         variables: {
            id: state.id,
            set: {
               assets: {
                  images: images,
                  videos: [],
               },
            },
         },
      })
   }

   return (
      <Flex width="100%" style={{position:'relative', top:'22px'}}>
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

export default Photo
