import { Flex, Spacer, Tunnel, Tunnels, useTunnel } from '@dailykit/ui'
import React from 'react'
import { useMutation } from '@apollo/react-hooks'
import { Ranger } from '../../../../../shared/components/Ranger'
import { DataCard } from '../../../components'
import { ShadowCard } from '../styled'
import PackagingInformation from './PackagingInformation'
import { ResponsiveFlex, StyledFlex } from './styled'
import { PhotoTunnel } from './Tunnels'
import { toast } from 'react-toastify'
import { logger } from '../../../../../shared/utils'
import { GENERAL_ERROR_MESSAGE } from '../../../constants/errorMessages'
import { UPDATE_PACKAGING } from '../../../graphql'
import { Gallery } from '../../../../../shared/components'

export default function PackagingStats({ state }) {
   const [photoTunnel, openPhotoTunnel, closePhotoTunnel] = useTunnel(1)
   const [updatePackaging, { loading }] = useMutation(UPDATE_PACKAGING, {
      onCompleted: () => {
         toast.info('Packaging Image added !')
      },
      onError: error => {
         logger(error)
         toast.error(GENERAL_ERROR_MESSAGE)
      },
   })
   const addImage = images => {
      updatePackaging({
         variables: {
            id: state.id,
            object: {
               assets: {
                  images: images,
               },
            },
         },
      })
   }

   return (
      <>
         <Tunnels tunnels={photoTunnel}>
            <Tunnel layer={1} style={{ overflowY: 'auto' }}>
               <PhotoTunnel state={state} close={closePhotoTunnel} />
            </Tunnel>
         </Tunnels>
         <ResponsiveFlex container alignItems="center">
            <Flex width="100%">
               {state?.images != null && state?.images?.length ? (
                  <Gallery
                     list={state?.images || []}
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
            <Spacer xAxis size="16px" />
            <Flex width="100%">
               <ShadowCard>
                  <RangedStat packaging={state} />
                  <Spacer size="16px" />
                  <StyledFlex container>
                     <DataCard title="Awaiting" quantity={state.awaiting} />
                     <Spacer xAxis size="16px" />
                     <DataCard title="Committed" quantity={state.committed} />
                     <Spacer xAxis size="16px" />
                     <DataCard title="Consumed" quantity={state.consumed} />
                  </StyledFlex>
               </ShadowCard>
            </Flex>
         </ResponsiveFlex>
         <Spacer size="16px" />
         <PackagingInformation state={state} />
      </>
   )
}

function RangedStat({ packaging }) {
   return (
      <Ranger
         label="On hand qty"
         max={packaging.maxLevel}
         min={packaging.parLevel}
         maxLabel="Max Inventory qty"
         minLabel="Par level"
         value={packaging.onHand}
         style={{ marginTop: '72px' }}
      />
   )
}
