import { useMutation } from '@apollo/react-hooks'
import {
   Card,
   Filler,
   Flex,
   HorizontalTab,
   HorizontalTabList,
   HorizontalTabPanel,
   HorizontalTabPanels,
   HorizontalTabs,
   IconButton,
   Tunnel,
   Tunnels,
   useTunnel,
} from '@dailykit/ui'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'react-toastify'
import { DeleteIcon, EditIcon } from '../../../../../shared/assets/icons'
import { Tooltip } from '../../../../../shared/components'
import { logger } from '../../../../../shared/utils/errorLog'
import { NO_BULK_ITEMS } from '../../../constants/emptyMessages'
import { ERROR_DELETING_BULK_ITEM } from '../../../constants/errorMessages'
import {
   BULK_ITEM_DELETED,
   CONFIRM_DELETE_BULK_ITEM,
} from '../../../constants/successMessages'
import { DELETE_BULK_ITEM } from '../../../graphql'
import PlannedLotView from './PlannedLot'
import RealTimeView from './RealtimeView'
import { ConfigTunnel } from './tunnels'

const address = 'apps.inventory.views.forms.item.'

export default function ProcessingView({
   formState,
   proc = {},
   isDefault,
   openLinkConversionTunnel,
}) {
   const { t } = useTranslation()

   const [configTunnel, openConfigTunnel, closeConfigTunnel] = useTunnel(1)

   const [deleteBulkItem, { loading }] = useMutation(DELETE_BULK_ITEM, {
      onCompleted: () => {
         toast.info(BULK_ITEM_DELETED)
      },
      onError: error => {
         logger(error)
         toast.error(ERROR_DELETING_BULK_ITEM)
      },
   })

   const handleBulkItemDelete = () => {
      if (window.confirm(CONFIRM_DELETE_BULK_ITEM))
         deleteBulkItem({ variables: { id: proc.id } })
   }

   if (!proc) return <Filler message={NO_BULK_ITEMS} />

   return (
      <>
         <Tunnels tunnels={configTunnel}>
            <Tunnel style={{ overflowY: 'auto' }} layer={1} size="lg">
               <ConfigTunnel
                  close={closeConfigTunnel}
                  open={openConfigTunnel}
                  proc={proc}
                  openLinkConversionTunnel={openLinkConversionTunnel}
               />
            </Tunnel>
         </Tunnels>
         <HorizontalTabs>
            <HorizontalTabList>
               <HorizontalTab>
                  <Flex container alignItems="center">
                     Bulk
                     <Tooltip identifier="supplier_item_form_realtime_panel" />
                  </Flex>
               </HorizontalTab>
               <HorizontalTab>
                  <Flex container alignItems="center">
                     Sachets
                     <Tooltip identifier="supplier_item_form_planned-lot_panel" />
                  </Flex>
               </HorizontalTab>
            </HorizontalTabList>

            <HorizontalTabPanels>
               <HorizontalTabPanel>
                  {proc ? (
                     <Flex container justifyContent="flex-end">
                        <IconButton
                           onClick={() => openConfigTunnel(1)}
                           type="outline"
                        >
                           <EditIcon />
                        </IconButton>
                        {!isDefault ? (
                           <>
                              <span style={{ width: '8px' }} />
                              <IconButton
                                 onClick={handleBulkItemDelete}
                                 type="ghost"
                                 disabled={loading}
                              >
                                 <DeleteIcon color="#FF5A52" />
                              </IconButton>
                           </>
                        ) : null}
                     </Flex>
                  ) : null}
                  <RealtimePanel proc={proc || {}} formState={formState} />
               </HorizontalTabPanel>
               <HorizontalTabPanel>
                  <PlannedLotView
                     sachetItems={proc?.sachetItems}
                     procId={proc?.id}
                     unit={proc?.unit}
                     openLinkConversionTunnel={openLinkConversionTunnel}
                  />
               </HorizontalTabPanel>
            </HorizontalTabPanels>
         </HorizontalTabs>
      </>
   )
}

function RealtimePanel({ formState, proc }) {
   return (
      <Flex container flexDirection="column">
         <Flex flex={4}>
            <RealTimeView proc={proc} formState={formState} />
         </Flex>
         <Flex flex={1}>
            <Card>
               <Card.Title>{proc.name}</Card.Title>
               <Card.Img src={proc.image} alt="processing" />
               <Card.Body>
                  <Card.Text>
                     <Card.Stat>
                        <span>Bulk Density:</span>
                        <span>{proc.bulkDensity}</span>
                     </Card.Stat>
                  </Card.Text>
                  <Card.Text>
                     <Card.Stat>
                        <span>% of yield:</span>
                        <span>{proc.yield?.value || 'N/A'}</span>
                     </Card.Stat>
                  </Card.Text>
                  <Card.Text>
                     <Card.Stat>
                        <span>Labour time per unit:</span>
                        <span>{`${proc.labor?.value || 'N/A'} ${
                           proc.labor?.unit || ''
                        }`}</span>
                     </Card.Stat>
                  </Card.Text>

                  <Card.Text>
                     <Card.Stat>
                        <span>Shelf life:</span>
                        <span>{`${proc.shelfLife?.value || 'N/A'} ${
                           proc.shelfLife?.unit || ''
                        }`}</span>
                     </Card.Stat>
                  </Card.Text>
               </Card.Body>
            </Card>
         </Flex>
      </Flex>
   )
}
