import { useMutation } from '@apollo/react-hooks'
import {
   Avatar,
   ButtonTile,
   Flex,
   Form,
   IconButton,
   Spacer,
   Text,
} from '@dailykit/ui/'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'react-toastify'
import { EditIcon } from '../../../../../shared/assets/icons'
import { logger } from '../../../../../shared/utils'
import { ItemCard, Separator } from '../../../components'
import { GENERAL_ERROR_MESSAGE } from '../../../constants/errorMessages'
import {
   CHANGE_OUTPUT_QUANTITY,
   UPDATE_SACHET_WORK_ORDER,
} from '../../../graphql'

const address = 'apps.inventory.views.forms.sachetworkorder.'

export default function Configurator({
   openPackagingTunnel,
   openLabelTemplateTunnel,
   openUserTunnel,
   openStationTunnel,
   state,
}) {
   const { t } = useTranslation()

   const [updateSachetWorkOrder] = useMutation(UPDATE_SACHET_WORK_ORDER, {
      onCompleted: () => {
         toast.info('Work Order updated successfully!')
      },
      onError: error => {
         logger(error)
         toast.error(GENERAL_ERROR_MESSAGE)
      },
   })

   const [quantity, setQuantity] = useState(state.outputQuantity || 0)

   const [changeQuantity] = useMutation(CHANGE_OUTPUT_QUANTITY, {
      onCompleted: resp => {
         const { outputQuantity } = resp.updateSachetWorkOrder.returning[0]
         setQuantity(outputQuantity)
      },
      onError: error => {
         logger(error)
         toast.error(GENERAL_ERROR_MESSAGE)
      },
   })

   const [assignedDate, setAssignedDate] = useState(state.scheduledOn)

   const inputQuantity = state.outputQuantity * +state.outputSachetItem.unitSize

   return (
      <>
         <Separator />
         <Flex container margin="0px 0px 0px 16px">
            <Flex>
               <Form.Group>
                  <Form.Label htmlFor="quantity" title="quantity">
                     Enter Number of Sachets
                  </Form.Label>

                  <Form.Number
                     id="quantity"
                     placeholder="quantity..."
                     disabled={state.status !== 'UNPUBLISHED'}
                     value={quantity}
                     name="quantity"
                     onChange={e => setQuantity(e.target.value)}
                     onBlur={e => {
                        changeQuantity({
                           variables: {
                              id: state.id,
                              set: {
                                 outputQuantity: +e.target.value,
                                 inputQuantity:
                                    +e.target.value *
                                    +state.outputSachetItem.unitSize,
                              },
                           },
                        })
                     }}
                  />
               </Form.Group>
            </Flex>

            <Spacer xAxis size="16px" />

            <div>
               {state.outputQuantity ? (
                  <>
                     <Text as="subtitle">
                        {t(address.concat('suggested committed quantity'))}
                     </Text>
                     <Spacer size="8px" />
                     <Text as="title">
                        {inputQuantity} {state.outputSachetItem.unit}
                     </Text>
                  </>
               ) : null}
            </div>
         </Flex>

         <Spacer size="8px" />

         <Text as="title">{t(address.concat('packaging'))}</Text>

         <>
            {state.packaging?.name ? (
               <ItemCard
                  title={state.packaging.name}
                  edit={() => openPackagingTunnel(1)}
               />
            ) : (
               <ButtonTile
                  noIcon
                  type="secondary"
                  text={t(address.concat('select packaging'))}
                  onClick={() => openPackagingTunnel(1)}
               />
            )}
         </>

         <Spacer size="8px" />

         {state.packaging?.name && (
            <>
               <Text as="title">{t(address.concat('label template'))}</Text>
               <>
                  {state.label &&
                  Array.isArray(state.label) &&
                  state.label[0].title ? (
                     <ItemCard
                        title={state.label.map(temp => temp.title).join(', ')}
                        edit={() => openLabelTemplateTunnel(1)}
                     />
                  ) : (
                     <ButtonTile
                        noIcon
                        type="secondary"
                        text={t(address.concat('select label template'))}
                        onClick={() => openLabelTemplateTunnel(1)}
                     />
                  )}
               </>
            </>
         )}

         <Spacer size="8px" />

         <Text as="title">{t(address.concat('user assigned'))}</Text>

         <>
            {state.user?.firstName ? (
               <Flex
                  container
                  margin="16px 0 0 16px"
                  padding="20px"
                  width="fit-content"
                  style={{ backgroundColor: '#f3f3f3', borderRadius: '4px' }}
               >
                  <Avatar
                     withName
                     title={`${state.user.firstName} ${
                        state.user.lastName || ''
                     }`}
                  />
                  <Spacer xAxis size="68px" />
                  <IconButton onClick={() => openUserTunnel(1)} type="outline">
                     <EditIcon />
                  </IconButton>
               </Flex>
            ) : (
               <ButtonTile
                  noIcon
                  type="secondary"
                  text={t(address.concat('select and assign user to work'))}
                  onClick={() => openUserTunnel(1)}
               />
            )}
         </>

         <Spacer size="8px" />
         <Flex container margin="0px 0px 0px 16px">
            <Form.Group>
               <Form.Label htmlFor="scheduledDate" title="scheduledDate">
                  {t(address.concat('scheduled on'))}
               </Form.Label>
               <Form.Date
                  id="scheduledDate"
                  name="scheduleDate"
                  disabled={state.status !== 'UNPUBLISHED'}
                  value={assignedDate}
                  onChange={e => {
                     setAssignedDate(e.target.value)
                  }}
                  placeholder="schedule date..."
                  onBlur={e => {
                     updateSachetWorkOrder({
                        variables: {
                           id: state.id,
                           set: {
                              scheduledOn: e.target.value,
                           },
                        },
                     })
                  }}
               />
            </Form.Group>
         </Flex>

         <Spacer size="16px" />

         <>
            <Text as="title">{t(address.concat('station assigned'))}</Text>

            {state.station?.name ? (
               <ItemCard
                  title={state.station.name}
                  edit={() => openStationTunnel(1)}
               />
            ) : (
               <ButtonTile
                  noIcon
                  type="secondary"
                  text={t(
                     address.concat('select and assign station to route to')
                  )}
                  onClick={() => openStationTunnel(1)}
               />
            )}
         </>
         <Spacer size="16px" />
      </>
   )
}
