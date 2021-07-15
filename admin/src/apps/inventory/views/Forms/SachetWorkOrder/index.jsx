import { useMutation, useSubscription } from '@apollo/react-hooks'
import {
   ButtonTile,
   Flex,
   Loader,
   Spacer,
   Text,
   TextButton,
   Tunnel,
   Tunnels,
   useTunnel,
} from '@dailykit/ui/'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import { ErrorState } from '../../../../../shared/components'
import { logger } from '../../../../../shared/utils'
import { ItemCard, StatusSwitch } from '../../../components'
import { GENERAL_ERROR_MESSAGE } from '../../../constants/errorMessages'
import {
   SACHET_WORK_ORDER_SUBSCRIPTION,
   UPDATE_SACHET_WORK_ORDER,
} from '../../../graphql'
import { StyledWrapper } from '../styled'
import Configurator from './Configurator'
import SelectInputBulkItemTunnel from './Tunnels/SelectInputBulkItemTunnel'
import SelectLabelTemplateTunnel from './Tunnels/SelectLabelTemplateTunnel'
import SelectOutputSachetItemTunnel from './Tunnels/SelectOutputSachetItemTunnel'
import SelectPackagingTunnel from './Tunnels/SelectPackagingTunnel'
import SelectStationTunnel from './Tunnels/SelectStationTunnel'
import SelectSupplierItemTunnel from './Tunnels/SelectSupplierItemTunnel'
import SelectUserTunnel from './Tunnels/SelectUserTunnel'

const address = 'apps.inventory.views.forms.sachetworkorder.'

const onError = error => {
   logger(error)
   toast.error(GENERAL_ERROR_MESSAGE)
}

export default function SachetWorkOrder() {
   const { t } = useTranslation()
   const { id } = useParams()

   const [
      supplierItemTunnel,
      openSupplierItemTunnel,
      closeSupplierItemTunnel,
   ] = useTunnel(1)
   const [
      outputSachetItemTunnel,
      openOutputSachetItemTunnel,
      closeOutputSachetItemTunnel,
   ] = useTunnel(1)
   const [userTunnel, openUserTunnel, closeUserTunnel] = useTunnel(1)
   const [stationTunnel, openStationTunnel, closeStationTunnel] = useTunnel(1)
   const [
      inputBulkItemTunnel,
      openInputBulkItemTunnel,
      closeInputBulkItemTunnel,
   ] = useTunnel(1)
   const [
      packagingTunnel,
      openPackagingTunnel,
      closePackagingTunnel,
   ] = useTunnel(1)
   const [
      labelTemplateTunnel,
      openLabelTemplateTunnel,
      closeLabelTemplateTunnel,
   ] = useTunnel(1)

   const {
      data: { sachetWorkOrder: state = {} } = {},
      loading: orderLoading,
      error,
   } = useSubscription(SACHET_WORK_ORDER_SUBSCRIPTION, {
      variables: { id },
   })

   const [updateSachetWorkOrder] = useMutation(UPDATE_SACHET_WORK_ORDER, {
      onCompleted: () => {
         toast.info('Work Order updated successfully!')
      },
      onError,
   })

   const checkForm = () => {
      if (!state.supplierItem?.id) {
         toast.error('No Supplier Item selecetd!')
         return false
      }
      if (!state.bulkItem?.id) {
         toast.error('No Input Bulk Item selecetd!')
         return false
      }
      if (!state.outputSachetItem?.id) {
         toast.error('No Output Bulk Item selecetd!')
         return false
      }

      if (!state.scheduledOn) {
         toast.error("Can't publish unscheduled work order!")
         return false
      }

      return true
   }

   const saveStatus = status => {
      updateSachetWorkOrder({
         variables: {
            id: state.id,
            set: { status },
         },
      })
   }

   const handlePublish = () => {
      const isValid = checkForm()

      if (isValid) {
         updateSachetWorkOrder({
            variables: {
               id: state.id,
               set: { isPublished: true, status: 'PENDING' },
            },
         })
      }
   }

   if (error) {
      onError(error)
      return <ErrorState />
   }

   if (orderLoading) return <Loader />

   return (
      <>
         <Tunnels tunnels={supplierItemTunnel}>
            <Tunnel layer={1}>
               <SelectSupplierItemTunnel
                  close={closeSupplierItemTunnel}
                  state={state}
               />
            </Tunnel>
         </Tunnels>
         <Tunnels tunnels={outputSachetItemTunnel}>
            <Tunnel layer={1}>
               <SelectOutputSachetItemTunnel
                  close={closeOutputSachetItemTunnel}
                  state={state}
               />
            </Tunnel>
         </Tunnels>
         <Tunnels tunnels={userTunnel}>
            <Tunnel layer={1}>
               <SelectUserTunnel close={closeUserTunnel} state={state} />
            </Tunnel>
         </Tunnels>
         <Tunnels tunnels={stationTunnel}>
            <Tunnel layer={1}>
               <SelectStationTunnel close={closeStationTunnel} state={state} />
            </Tunnel>
         </Tunnels>
         <Tunnels tunnels={inputBulkItemTunnel}>
            <Tunnel layer={1}>
               <SelectInputBulkItemTunnel
                  close={closeInputBulkItemTunnel}
                  state={state}
               />
            </Tunnel>
         </Tunnels>
         <Tunnels tunnels={packagingTunnel}>
            <Tunnel layer={1}>
               <SelectPackagingTunnel
                  state={state}
                  close={closePackagingTunnel}
               />
            </Tunnel>
         </Tunnels>
         <Tunnels tunnels={labelTemplateTunnel}>
            <Tunnel layer={1}>
               <SelectLabelTemplateTunnel
                  state={state}
                  close={closeLabelTemplateTunnel}
               />
            </Tunnel>
         </Tunnels>

         <StyledWrapper>
            <Flex
               container
               alignItems="center"
               justifyContent="space-between"
               padding="16px 0"
            >
               <Text as="h1">
                  {t(address.concat('work order'))}{' '}
                  {state.supplierItem?.name
                     ? `- ${state.supplierItem.name}`
                     : null}
               </Text>

               {state.isPublished ? (
                  <StatusSwitch
                     currentStatus={state.status}
                     onSave={saveStatus}
                  />
               ) : (
                  <TextButton onClick={handlePublish} type="solid">
                     {t(address.concat('publish'))}
                  </TextButton>
               )}
            </Flex>

            <Spacer size="16px" />

            <Text as="title">{t(address.concat('select supplier item'))}</Text>
            {state.supplierItem?.name ? (
               <>
                  {state.isPublished ? (
                     <ItemCard title={state.supplierItem.name} />
                  ) : (
                     <ItemCard
                        title={state.supplierItem.name}
                        edit={() => openSupplierItemTunnel(1)}
                     />
                  )}
               </>
            ) : (
               <ButtonTile
                  noIcon
                  type="secondary"
                  text={t(address.concat('select supplier item'))}
                  onClick={() => openSupplierItemTunnel(1)}
               />
            )}

            <Spacer size="16px" />

            {state.supplierItem?.name ? (
               <>
                  <Text as="title">{t(address.concat('input bulk item'))}</Text>
                  {state.bulkItem?.processingName ? (
                     <>
                        {state.isPublished ? (
                           <ItemCard
                              title={state.bulkItem?.processingName}
                              onHand={`${state.bulkItem?.onHand} ${state.bulkItem?.unit}`}
                              shelfLife={`${state.bulkItem?.shelfLife?.value} ${
                                 state.bulkItem?.shelfLife?.unit || ''
                              }`}
                              isBulk
                           />
                        ) : (
                           <ItemCard
                              title={state.bulkItem?.processingName}
                              onHand={`${state.bulkItem?.onHand} ${state.bulkItem?.unit}`}
                              isBulk
                              shelfLife={`${state.bulkItem?.shelfLife?.value} ${
                                 state.bulkItem?.shelfLife?.unit || ''
                              }`}
                              edit={() => openInputBulkItemTunnel(1)}
                           />
                        )}
                     </>
                  ) : (
                     <ButtonTile
                        noIcon
                        type="secondary"
                        text={t(address.concat('select input bulk item'))}
                        onClick={() => openInputBulkItemTunnel(1)}
                     />
                  )}
               </>
            ) : null}

            <Spacer size="16px" />

            {state.bulkItem?.id ? (
               <>
                  <Text as="title">
                     {t(address.concat('output sachet item'))}
                  </Text>
                  {state.outputSachetItem?.unitSize ? (
                     <>
                        {state.isPublished ? (
                           <ItemCard
                              title={`${state.outputSachetItem.unitSize} ${state.outputSachetItem.unit}`}
                              onHand={`${state.outputSachetItem.onHand} ${state.outputSachetItem.unit}`}
                              par={`${state.outputSachetItem.parLevel} ${state.bulkItem?.unit}`}
                              isBulk
                           />
                        ) : (
                           <ItemCard
                              title={`${state.outputSachetItem.unitSize} ${state.outputSachetItem.unit}`}
                              onHand={`${state.outputSachetItem.onHand} ${state.outputSachetItem.unit}`}
                              par={`${state.outputSachetItem.parLevel} ${state.bulkItem?.unit}`}
                              isBulk
                              edit={() => {
                                 openOutputSachetItemTunnel(1)
                              }}
                           />
                        )}
                     </>
                  ) : (
                     <ButtonTile
                        noIcon
                        type="secondary"
                        text={t(address.concat('select output sachet item'))}
                        onClick={() => {
                           openOutputSachetItemTunnel(1)
                        }}
                     />
                  )}
               </>
            ) : null}

            {state.outputSachetItem?.id && (
               <Configurator
                  openPackagingTunnel={openPackagingTunnel}
                  openLabelTemplateTunnel={openLabelTemplateTunnel}
                  openUserTunnel={openUserTunnel}
                  openStationTunnel={openStationTunnel}
                  state={state}
               />
            )}
         </StyledWrapper>
      </>
   )
}
