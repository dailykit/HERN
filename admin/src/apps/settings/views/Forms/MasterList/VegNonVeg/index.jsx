import React from 'react'
import {
   ComboButton,
   IconButton,
   Text,
   Tunnel,
   Tunnels,
   useTunnel,
   Flex,
} from '@dailykit/ui'
import {
   //    Tooltip,
   //    ErrorState,
   //    InlineLoader,
   Banner,
} from '../../../../../../shared/components'
import { AddIcon, DeleteIcon } from '../../../../../../shared/assets/icons'

const VegNonVeg = () => {
   const [tunnels, openTunnel, closeTunnel] = useTunnel()

   return (
      <>
         <Flex width="calc(100% - 32px)" maxWidth="1280px" margin="0 auto">
            <Banner id="settings-app-master-lists-vegnonveg-top" />
            <Flex
               as="header"
               container
               height="80px"
               alignItems="center"
               justifyContent="space-between"
            >
               <Flex container alignItems="center">
                  <Text as="h2">Veg-NonVeg (0)</Text>
               </Flex>
               <ComboButton type="solid" onClick={() => openTunnel(1)}>
                  <AddIcon size={24} /> Create new type
               </ComboButton>
            </Flex>
            <Banner id="settings-app-master-lists-vegnonveg-bottom" />
         </Flex>
      </>
   )
}

export default VegNonVeg
