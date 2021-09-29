import React from 'react'
import {
   ButtonTile,
   IconButton,
   Tag,
   TagGroup,
   Tunnels,
   Tunnel,
   useTunnel,
   Flex,
   Spacer,
   Text,
} from '@dailykit/ui'
import { useTranslation } from 'react-i18next'
import { EditIcon } from '../../../../../assets/icons'
import { StyledAction, StyledContainer, StyledRow } from './styled'
import { DescriptionTunnel } from '../../tunnels'
import { Tooltip } from '../../../../../../../shared/components'

const address =
   'apps.menu.views.forms.product.simplerecipeproduct.components.description.'

const Description = ({ state }) => {
   const { t } = useTranslation()

   const [tunnels, openTunnel, closeTunnel] = useTunnel()

   return (
      <>
         <Tunnels tunnels={tunnels}>
            <Tunnel layer={1}>
               <DescriptionTunnel state={state} close={closeTunnel} />
            </Tunnel>
         </Tunnels>
         
      </>
   )
}

export default Description
