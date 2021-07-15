import { useMutation } from '@apollo/react-hooks'
import { Loader, Text, TunnelHeader } from '@dailykit/ui'
import React from 'react'
import { toast } from 'react-toastify'
import { logger, randomSuffix } from '../../../../../shared/utils/index'
import { TunnelContainer } from '../../../components'
import { GENERAL_ERROR_MESSAGE } from '../../../constants/errorMessages'
import {
   ADD_PACKAGING_TUNNEL_ASSEMBLY_PACKET,
   ADD_PACKAGING_TUNNEL_SACHETS,
} from '../../../constants/infoMessages'
import { useTabs } from '../../../../../shared/providers'
import { CREATE_PACKAGING } from '../../../graphql'
import { SolidTile } from '../styled'
import { Banner } from '../../../../../shared/components'

export default function WorkOrderTypeTunnel({ close }) {
   const { addTab } = useTabs()

   const [createPackaging, { loading }] = useMutation(CREATE_PACKAGING, {
      onError: error => {
         logger(error)
         toast.error(GENERAL_ERROR_MESSAGE)
      },
      onCompleted: input => {
         const { packagingName, id } = input.createPackaging.returning[0]
         addTab(packagingName, `/inventory/packagings/${id}`)
      },
   })

   const createPackagingHandler = type => {
      const packagingName = `pack-${randomSuffix()}`
      createPackaging({
         variables: {
            object: {
               name: packagingName,
               type,
               packagingSpecification: {
                  data: {
                     compostable: false,
                  },
               },
            },
         },
      })
   }

   if (loading) return <Loader />

   return (
      <>
         <TunnelHeader
            title="select type of packaging"
            close={() => {
               close(1)
            }}
         />
         <Banner id="inventory-app-packaging-packaging-type-tunnel-top" />
         <TunnelContainer>
            <SolidTile onClick={() => createPackagingHandler('SACHET_PACKAGE')}>
               <Text as="h1">Sachets</Text>
               <Text as="subtitle">
                  Sachets are used for packaging ingredients for a meal kit.
               </Text>
            </SolidTile>
            <br />
            <SolidTile
               onClick={() => createPackagingHandler('ASSEMBLY_PACKAGE')}
            >
               <Text as="h1">Assembly Packet</Text>
               <Text as="subtitle">
                  Assembly packet is used to assemble all the sacheted
                  ingredients into one kit.
               </Text>
            </SolidTile>
         </TunnelContainer>
         <Banner id="inventory-app-packaging-packaging-type-tunnel-bottom" />
      </>
   )
}
