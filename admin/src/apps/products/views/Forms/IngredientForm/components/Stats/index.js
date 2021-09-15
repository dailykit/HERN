import React from 'react'
import {
   ButtonTile,
   Flex,
   Spacer,
   Text,
   Tunnel,
   Tunnels,
   useTunnel,
} from '@dailykit/ui'
import { useMutation } from '@apollo/react-hooks'
import { toast } from 'react-toastify'
import { DeleteIcon, EditIcon } from '../../../../../assets/icons'
import { ImageContainer, ResponsiveFlex } from './styled'
import { UPDATE_INGREDIENT } from '../../../../../graphql'
import { PhotoTunnel } from '../../tunnels'
import { logger } from '../../../../../../../shared/utils'
import { Gallery } from '../../../../../../../shared/components'
import styled from 'styled-components'

const Stats = ({ state }) => {
   const [tunnels, openTunnel, closeTunnel] = useTunnel(1)

   const [updateIngredient] = useMutation(UPDATE_INGREDIENT, {
      onCompleted: () => {
         toast.success('Image updated!')
      },
      onError: error => {
         toast.error('Something went wrong!')
         logger(error)
      },
   })

   const addImage = images => {
      updateIngredient({
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
      <>
         <Tunnels tunnels={tunnels}>
            <Tunnel layer={1}>
               <PhotoTunnel state={state} closeTunnel={closeTunnel} />
            </Tunnel>
         </Tunnels>

         <ResponsiveFlex container>
            <Flex
               container
               alignItems="center"
               justifyContent="center"
               width="100%"
            >
               <Flex
                  padding="0 16px 0 0"
                  style={{ borderRight: '1px solid #dddddd' }}
                  title='Total number of Processings'
               >
                  <Text as="h1">{state.ingredientProcessings?.length}</Text>
                  <Text as="title">Processings</Text>
               </Flex>
               <Flex padding="0 0 0 16px" title='Total number of Sachets'>
                  <Text as="h1">{state.ingredientSachets?.length}</Text>
                  <Text as="title">Sachets</Text>
               </Flex>
            </Flex>
            <Spacer size="32px" />
            {/* {state.image ? (
               <ImageContainer>
                  <div>
                     <span
                        role="button"
                        tabIndex="0"
                        onClick={() => openTunnel(1)}
                        onKeyDown={e => e.charCode === 13 && openTunnel(1)}
                     >
                        <EditIcon />
                     </span>
                     <span
                        role="button"
                        tabIndex="0"
                        onClick={removeImage}
                        onKeyDown={e => e.charCode === 13 && openTunnel(1)}
                     >
                        <DeleteIcon />
                     </span>
                  </div>
                  <img src={state.image} alt="Ingredient" />
               </ImageContainer>
            ) : (
               <Flex width="400px">
                  <ButtonTile
                     type="primary"
                     size="sm"
                     text="Add Photo to your Ingredient"
                     helper="upto 1MB - only JPG, PNG, PDF allowed"
                     onClick={() => openTunnel(1)}
                  />
               </Flex>
            )} */}
            <Flex width="66%" title='Add image to ingredient'>
               {state?.assets?.images != null &&
               state?.assets?.images?.length ? (
                  <Gallery
                     list={state.assets.images}
                     isMulti={false}
                     onChange={images => {
                        addImage(images)
                     }}
                  />
               ) : (
                  <Gallery
                     list={[]}
                     isMulti={false}
                     onChange={images => {
                        addImage(images)
                     }}
                  />
               )}
            </Flex>
         </ResponsiveFlex>
      </>
   )
}

export default Stats
