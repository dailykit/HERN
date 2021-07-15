import { useSubscription } from '@apollo/react-hooks'
import {
   ButtonTile,
   Flex,
   IconButton,
   Spacer,
   Text,
   Tunnel,
   Tunnels,
   useTunnel,
} from '@dailykit/ui'
import React from 'react'
import { toast } from 'react-toastify'
import { EditIcon } from '../../../../../../shared/assets/icons'
import { Tooltip } from '../../../../../../shared/components'
import { logger } from '../../../../../../shared/utils'
import { GENERAL_ERROR_MESSAGE } from '../../../../constants/errorMessages'
import { PACKAGING_SPECS_SUBSCRIPTION } from '../../../../graphql'
import { ShadowCard } from '../../styled'
import AdditionalInfo from '../AdditionalInfo'
import { OtherProperties, PackagingMaterial } from '../Tunnels'
import renderIcon from './renderIcon'
import { ResponsiveFlex, Content } from './styled'

// Props<{state: Packaging}>
export default function PackagingInformation({ state }) {
   const [
      otherPropertiesTunnel,
      openOtherPropertiesTunnel,
      closeOtherPropertiesTunnel,
   ] = useTunnel(1)

   const [
      packagingMaterial,
      openPackagingMaterial,
      closePackagingMaterial,
   ] = useTunnel(1)

   const {
      data: { packaging: { packagingSpecification: spec = {} } = {} } = {},
      error,
   } = useSubscription(PACKAGING_SPECS_SUBSCRIPTION, {
      variables: { id: state.id },
   })

   if (error) {
      logger(error)
      toast.error(GENERAL_ERROR_MESSAGE)
   }

   return (
      <>
         <Tunnels tunnels={otherPropertiesTunnel}>
            <Tunnel layer={1} style={{ overflowY: 'auto' }} size="sm">
               <OtherProperties
                  state={spec}
                  close={closeOtherPropertiesTunnel}
               />
            </Tunnel>
         </Tunnels>

         <Tunnels tunnels={packagingMaterial}>
            <Tunnel layer={1} style={{ overflowY: 'auto' }} size="sm">
               <PackagingMaterial state={spec} close={closePackagingMaterial} />
            </Tunnel>
         </Tunnels>

         <ResponsiveFlex container>
            <Flex flex={2}>
               <AdditionalInfo id={state.id} />
            </Flex>
            <Spacer xAxis size="16px" />
            <Flex flex={3}>
               <ShadowCard style={{ flexDirection: 'column' }}>
                  <Spacer size="16px" />
                  <Flex
                     container
                     alignItems="center"
                     justifyContent="space-between"
                  >
                     <Flex container alignItems="center">
                        <Text as="title">Packaging Material</Text>
                        <Tooltip identifier="packaging_form-packaging_material" />
                     </Flex>
                     {spec.packagingMaterial ? (
                        <IconButton
                           type="outline"
                           onClick={() => openPackagingMaterial(1)}
                        >
                           <EditIcon />
                        </IconButton>
                     ) : null}
                  </Flex>
                  <Spacer size="16px" />

                  {spec.packagingMaterial ? (
                     <Text as="h3">{spec.packagingMaterial}</Text>
                  ) : (
                     <ButtonTile
                        noIcon
                        type="secondary"
                        text="Select Packaging Material"
                        onClick={() => openPackagingMaterial(1)}
                        style={{ margin: '20px 0' }}
                     />
                  )}
                  <Spacer size="16px" />

                  <Flex
                     container
                     alignItems="center"
                     justifyContent="space-between"
                  >
                     <Flex container alignItems="center">
                        <Text as="title">Other Properties</Text>
                        <Tooltip identifier="packaging_form-otherProperties" />
                     </Flex>
                     <IconButton
                        type="outline"
                        onClick={() => openOtherPropertiesTunnel(1)}
                     >
                        <EditIcon />
                     </IconButton>
                  </Flex>
                  <Spacer size="16px" />
                  <Content>
                     <Flex container alignItems="center">
                        {renderIcon(spec.recycled)}
                        <h4>Recyled</h4>
                     </Flex>
                     <Flex container alignItems="center">
                        {renderIcon(spec.compressibility)}
                        <h4>Compressable</h4>
                     </Flex>
                  </Content>
                  <Spacer size="16px" />

                  <Content>
                     <h4>
                        Opacity: <b>{spec.opacity ? spec.opacity : 'N/A'}</b>
                     </h4>
                  </Content>
                  <Spacer size="16px" />
               </ShadowCard>
            </Flex>
         </ResponsiveFlex>
      </>
   )
}
