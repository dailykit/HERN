import { useMutation, useSubscription } from '@apollo/react-hooks'
import {
   Flex,
   Form,
   IconButton,
   Loader,
   SectionTab,
   SectionTabList,
   SectionTabPanel,
   SectionTabPanels,
   SectionTabs,
   SectionTabsListHeader,
   Spacer,
   Text,
   Tunnel,
   Tunnels,
   useTunnel,
} from '@dailykit/ui'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import AddIcon from '../../../../../shared/assets/icons/Add'
import {
   Banner,
   LinkUnitConversionTunnels,
   Tooltip,
} from '../../../../../shared/components'
import { currencyFmt } from '../../../../../shared/utils'
import { logger } from '../../../../../shared/utils/errorLog'
import { ClockIcon, ItemIcon } from '../../../assets/icons'
import { GENERAL_ERROR_MESSAGE } from '../../../constants/errorMessages'
import { BULK_ITEM_CREATED } from '../../../constants/successMessages'
import { useTabs } from '../../../../../shared/providers'
import {
   CREATE_BULK_ITEM,
   SUPPLIER_ITEM_SUBSCRIPTION,
   UPDATE_SUPPLIER_ITEM,
} from '../../../graphql'
import { validators } from '../../../utils/validators'
import ContactPerson from './Components/ContactPerson'
import ProcessingView from './ProcessingView'
import {
   StyledGrid,
   StyledInfo,
   StyledSupplier,
   MiseInPlaceItems,
   MiseInPlaceWrapper,
   ReceivedFromSupplier,
} from './styled'
import {
   ConfigTunnel,
   InfoTunnel,
   ProcessingTunnel,
   SuppliersTunnel,
} from './tunnels'
import { SupplierItemProvider } from '../../../context/sachetItem'

const address = 'apps.inventory.views.forms.item.'

export default function ItemForm() {
   const { t } = useTranslation()
   const [formState, setFormState] = React.useState({})
   const [itemName, setItemName] = React.useState({
      value: '',
      meta: {
         errors: [],
         isValid: false,
         isTouched: false,
      },
   })
   const [tabState, setTabState] = React.useState({
      schema: 'inventory',
      table: 'bulkItem',
      entityId: null,
   })

   const { id } = useParams()
   const { setTabTitle } = useTabs()

   const [
      linkConversionTunnels,
      openLinkConversionTunnel,
      closeLinkConversionTunnel,
   ] = useTunnel(2)
   const [supplierTunnel, openSupplierTunnel, closeSupplierTunnel] =
      useTunnel(1)
   const [infoTunnel, openInfoTunnel, closeInfoTunnel] = useTunnel(1)
   const [processingTunnel, openProcessingTunnel, closeProcessingTunnel] =
      useTunnel(1)
   const [configTunnel, openConfigTunnel, closeConfigTunnel] = useTunnel(1)

   const { loading: itemDetailLoading, error } = useSubscription(
      SUPPLIER_ITEM_SUBSCRIPTION,
      {
         variables: { id },
         onSubscriptionData: input => {
            const data = input.subscriptionData.data.supplierItem
            console.log({ data })
            setItemName({ value: data.name, meta: { ...itemName.meta } })
            setFormState(data)
         },
      }
   )
   if (error) console.log(error)

   const [updateSupplierItem] = useMutation(UPDATE_SUPPLIER_ITEM, {
      onError: error => {
         logger(error)
         toast.error(GENERAL_ERROR_MESSAGE)
      },
      onCompleted: () => {
         toast.info('Supplier Item updated!')
         setTabTitle(itemName.value)
      },
   })

   const [
      createBulkItem,
      {
         loading: creatingBulkItem,
         data: { createBulkItem: { returning: bulktItems = [] } = {} } = {},
      },
   ] = useMutation(CREATE_BULK_ITEM, {
      onCompleted: data => {
         if (formState.bulkItemAsShippedId) {
            toast.info(BULK_ITEM_CREATED)
            openConfigTunnel(1)
         } else {
            updateSupplierItem({
               variables: {
                  id: formState.id,
                  object: {
                     bulkItemAsShippedId: data.createBulkItem.returning[0].id,
                  },
               },
            })

            openConfigTunnel(1)
         }
      },
      onError: error => {
         logger(error)
         toast.error(GENERAL_ERROR_MESSAGE)
      },
   })

   const updateItemName = e => {
      const { isValid, errors } = validators.name(e.target.value, 'item name')

      if (isValid)
         updateSupplierItem({
            variables: {
               id: formState.id,
               object: { name: itemName.value },
            },
         })

      setItemName({
         value: formState.name,
         meta: {
            isValid,
            errors,
            isTouched: true,
         },
      })
   }

   const handleOpenLinkConversionTunnel = data => {
      setTabState({ ...data })
      openLinkConversionTunnel(1)
   }

   if (itemDetailLoading) return <Loader />

   return (
      <SupplierItemProvider>
         <Tunnels tunnels={supplierTunnel}>
            <Tunnel layer={1} style={{ overflowY: 'auto' }}>
               <SuppliersTunnel
                  close={closeSupplierTunnel}
                  formState={formState}
               />
            </Tunnel>
         </Tunnels>
         <Tunnels tunnels={infoTunnel}>
            <Tunnel layer={1}>
               <InfoTunnel
                  close={() => closeInfoTunnel(1)}
                  formState={formState}
               />
            </Tunnel>
         </Tunnels>
         <Tunnels tunnels={processingTunnel}>
            <Tunnel layer={1} style={{ overflowY: 'auto' }}>
               <ProcessingTunnel
                  close={closeProcessingTunnel}
                  open={openProcessingTunnel}
                  formState={formState}
                  createBulkItem={createBulkItem}
                  creatingBulkItem={creatingBulkItem}
               />
            </Tunnel>
         </Tunnels>
         <Tunnels tunnels={configTunnel}>
            <Tunnel style={{ overflowY: 'auto' }} layer={1} size="lg">
               <ConfigTunnel
                  close={closeConfigTunnel}
                  open={openConfigTunnel}
                  id={bulktItems[0]?.id}
                  openLinkConversionTunnel={handleOpenLinkConversionTunnel}
               />
            </Tunnel>
         </Tunnels>
         <Banner id="inventory-app-items-form-top" />

         <div
            style={{ background: '#f3f3f3', minHeight: 'calc(100vh - 40px)' }}
         >
            <Flex
               margin="0 auto"
               padding="0 32px"
               style={{ background: '#fff' }}
            >
               <Flex
                  container
                  alignItems="center"
                  justifyContent="space-between"
                  padding="16px 0"
               >
                  {formState.name && (
                     <>
                        <StyledInfo>
                           <div>
                              <Form.Group>
                                 <Flex container alignItems="center">
                                    <Form.Label
                                       htmlFor="itemName"
                                       title="itemName"
                                    >
                                       Item Name
                                    </Form.Label>
                                    <Tooltip identifier="supplieritem_form_itemname_formfield" />
                                 </Flex>
                                 <Form.Text
                                    id="itemName"
                                    name="itemName"
                                    placeholder="Supplier Item Name..."
                                    value={itemName.value}
                                    onChange={e =>
                                       setItemName({
                                          value: e.target.value,
                                          meta: { ...itemName.meta },
                                       })
                                    }
                                    onBlur={updateItemName}
                                    hasError={
                                       itemName.meta.isTouched &&
                                       !itemName.meta.isValid
                                    }
                                 />
                                 {itemName.meta.isTouched &&
                                    !itemName.meta.isValid && (
                                       <Form.Error>
                                          {itemName.meta.errors[0]}
                                       </Form.Error>
                                    )}
                              </Form.Group>
                              <span>sku: {formState.sku || 'N/A'}</span>
                           </div>
                        </StyledInfo>
                        <StyledSupplier>
                           <ContactPerson
                              formState={formState}
                              open={openSupplierTunnel}
                           />
                        </StyledSupplier>
                     </>
                  )}
               </Flex>
            </Flex>
            <>
               <StyledGrid onClick={() => openInfoTunnel(1)}>
                  <div>
                     <div>
                        <ItemIcon />
                     </div>
                     <div>
                        <span>
                           <Text as="h4">
                              <Flex container alignItems="center">
                                 {t(address.concat('unit qty'))}
                                 <Tooltip identifier="supplieritem_form_unitquantity" />
                              </Flex>
                           </Text>
                        </span>
                        <div>
                           {/* prettier-ignore */}
                           <Text as="h3">
                              {(formState.unitSize || 'N/A') + ' ' + (formState.unit || '')}
                           </Text>
                        </div>
                     </div>
                  </div>
                  <div>
                     <div>
                        <ClockIcon />
                     </div>
                     <div>
                        <span>
                           <Text as="h4">
                              <Flex container alignItems="center">
                                 {t(address.concat('lead time'))}
                                 <Tooltip identifier="supplieritem_form_leadtime" />
                              </Flex>
                           </Text>
                        </span>
                        <div>
                           <Text as="h3">
                              {formState.leadTime?.value ? (
                                 <span>
                                    {`${formState.leadTime?.value} ${formState.leadTime?.unit}`}
                                 </span>
                              ) : (
                                 'N/A'
                              )}
                           </Text>
                        </div>
                     </div>
                  </div>
                  <div>
                     <div>{/* add icon here for unit price */}</div>
                     <div>
                        <span>
                           <Text as="h4">
                              <Flex container alignItems="center">
                                 Unit Price
                                 <Tooltip identifier="supplieritem_form_unitPrice" />
                              </Flex>
                           </Text>
                        </span>
                        <div>
                           {/* prettier-ignore */}
                           <Text as="h3">
                              {formState.prices?.length ? currencyFmt(+formState.prices[0]?.unitPrice?.value) : 'N/A'}
                           </Text>
                        </div>
                     </div>
                  </div>
               </StyledGrid>
               <SectionTabsListHeader>
                  <Text as="title">
                     <Flex container alignItems="center">
                        {t(address.concat('processings'))} (
                        {formState.bulkItems?.length})
                        <Tooltip identifier="supplieritem_form_processings" />
                     </Flex>
                  </Text>
                  <IconButton
                     onClick={() => {
                        if (!formState.supplier)
                           return toast.error('Select a supplier first!')

                        openProcessingTunnel(1)
                     }}
                     type="outline"
                  >
                     <AddIcon size="18" strokeWidth="3" color="#555B6E" />
                  </IconButton>
               </SectionTabsListHeader>
               <SectionTabs
                  style={{
                     width: 'calc(100vw - 64px)',
                     margin: '24px auto 0 auto',
                  }}
               >
                  <SectionTabList style={{ alignItems: 'baseline' }}>
                     <ReceivedFromSupplier>
                        {formState.bulkItemAsShipped?.name ? (
                           <>
                              <Flex
                                 container
                                 alignItems="center"
                                 margin="0 0 8px 0"
                              >
                                 <Text as="subtitle">
                                    as received from supplier
                                 </Text>
                                 <Tooltip identifier="supplieritem_form_as_received_from_supplier_bulkitems" />
                              </Flex>
                              <SectionTab>
                                 <Flex
                                    container
                                    style={{ textAlign: 'left' }}
                                    padding="14px"
                                    justifyContent="space-between"
                                 >
                                    <div>
                                       <h3 style={{ marginBottom: '5px' }}>
                                          {formState.bulkItemAsShipped.name}
                                       </h3>
                                       <Text as="subtitle">
                                          {t(address.concat('on hand'))}:{' '}
                                          {formState.bulkItemAsShipped.onHand}{' '}
                                          {formState.bulkItemAsShipped?.unit ||
                                             ''}
                                       </Text>
                                       {/* prettier-ignore */}
                                       <Text as="subtitle">
                                       {t(address.concat('shelf life'))}:{' '}
                                       {formState.bulkItemAsShipped.shelfLife
                                          ?.value || 'N/A'}{' '}
                                       {formState.bulkItemAsShipped.shelfLife
                                          ?.value
                                          ? formState.bulkItemAsShipped.shelfLife?.unit
                                          : ''}
                                    </Text>
                                    </div>
                                 </Flex>
                              </SectionTab>
                           </>
                        ) : null}
                     </ReceivedFromSupplier>
                     <MiseInPlaceWrapper>
                        {formState.bulkItems?.length ? (
                           <>
                              <Flex
                                 container
                                 alignItems="center"
                                 margin="8px 0"
                              >
                                 <Text as="subtitle">Mise en place</Text>
                                 <Tooltip identifier="supplieritem_form_derived_from_received_processing_bulkitems" />
                              </Flex>
                              <MiseInPlaceItems>
                                 {formState.bulkItems?.map(procs => {
                                    if (
                                       procs.id ===
                                       formState.bulkItemAsShippedId
                                    )
                                       return null
                                    return (
                                       <SectionTab key={procs.id}>
                                          <Flex
                                             style={{
                                                textAlign: 'left',
                                             }}
                                             padding="14px"
                                          >
                                             <h3
                                                style={{ marginBottom: '5px' }}
                                             >
                                                {procs.name}
                                             </h3>
                                             <Text as="subtitle">
                                                {t(address.concat('on hand'))}:{' '}
                                                {procs.onHand} {procs.unit}
                                             </Text>
                                             <Text as="subtitle">
                                                {t(
                                                   address.concat('shelf life')
                                                )}
                                                :{' '}
                                                {procs?.shelfLife?.value ||
                                                   'N/A'}{' '}
                                                {procs?.shelfLife?.value
                                                   ? procs?.shelfLife?.unit
                                                   : ''}
                                             </Text>
                                          </Flex>
                                       </SectionTab>
                                    )
                                 })}
                              </MiseInPlaceItems>
                           </>
                        ) : null}
                     </MiseInPlaceWrapper>
                  </SectionTabList>
                  <SectionTabPanels>
                     <SectionTabPanel>
                        <ProcessingView
                           formState={formState}
                           proc={formState.bulkItemAsShipped}
                           isDefault
                           openLinkConversionTunnel={
                              handleOpenLinkConversionTunnel
                           }
                        />
                     </SectionTabPanel>

                     {formState.bulkItems?.map(procs => {
                        if (procs.id === formState.bulkItemAsShippedId)
                           return null
                        return (
                           <SectionTabPanel key={procs.id}>
                              <ProcessingView
                                 formState={formState}
                                 proc={procs}
                                 openLinkConversionTunnel={
                                    handleOpenLinkConversionTunnel
                                 }
                              />
                           </SectionTabPanel>
                        )
                     })}
                  </SectionTabPanels>
               </SectionTabs>
            </>
         </div>
         <LinkUnitConversionTunnels
            schema="inventory"
            table={tabState.table}
            entityId={tabState.entityId}
            tunnels={linkConversionTunnels}
            openTunnel={openLinkConversionTunnel}
            closeTunnel={closeLinkConversionTunnel}
            onSave={() => closeLinkConversionTunnel(1)}
         />
         <Banner id="inventory-app-items-form-bottom" />
      </SupplierItemProvider>
   )
}
