import React, { useContext } from 'react'
import { isEmpty, isNull } from 'lodash'
import axios from 'axios'
import { toast } from 'react-toastify'
import styled from 'styled-components'
import { useSubscription, useMutation } from '@apollo/react-hooks'
import {
   Form,
   Flex,
   Spacer,
   Text,
   TextButton,
   IconButton,
   CloseIcon,
} from '@dailykit/ui'

import { QUERIES, MUTATIONS } from '../../graphql'
import { ScaleIcon } from '../../assets/icons'
import { logger, get_env } from '../../../../shared/utils'
import { useOrder, useConfig } from '../../context'
import { StyledIconButton } from '../OrderSummary/styled'
import {
   Tooltip,
   ErrorState,
   InlineLoader,
} from '../../../../shared/components'
import {
   Wrapper,
   StyledHeader,
   StyledMode,
   StyledMain,
   StyledStat,
   StyledWeigh,
   StyledPackaging,
   StyledSOP,
} from './styled'
import { BrandContext } from '../../../../App'

export const ProcessSachet = ({ closeOrderSummaryTunnel }) => {
   const {
      state: {
         current_view: currentView,
         sachet: { id, product },
      },
      switchView,
   } = useOrder()
   const { state } = useConfig()
   const [weight, setWeight] = React.useState(0)
   const [sachet, setSachet] = React.useState({})
   const [isLoading, setIsLoading] = React.useState(true)
   const [scaleState, setScaleState] = React.useState('low')
   const [labelPreview, setLabelPreview] = React.useState('')
   const [brandContext, setBrandContext] = useContext(BrandContext)

   const [updateCartItem] = useMutation(MUTATIONS.CART_ITEM.UPDATE, {
      onCompleted: () => toast.success('Succesfully updated sachet details!'),
      onError: error => {
         logger(error)
         toast.error('Failed to update sachet details!')
      },
   })

   const { error } = useSubscription(QUERIES.ORDER.SACHET.MULTIPLE, {
      variables: {
         where: {
            id: { _eq: id },
            parentCartItemId: { _eq: state?.current_product?.id },
            levelType: { _eq: 'orderItemSachet' },
            cart: {
               brandId: {
                  _in: brandContext.brandId
               }, locationId: {
                  _in: brandContext.locationId
               }
            }
         },
      },
      onSubscriptionData: ({
         subscriptionData: { data: { sachets = {} } = {} },
      }) => {
         if (!isEmpty(sachets)) {
            const [node] = sachets
            setWeight(0)
            setSachet(node)
         }
         setIsLoading(false)
      },
   })

   React.useEffect(() => {
      setWeight(0)
      setScaleState('low')
      setLabelPreview('')
   }, [id])

   const changeView = view => {
      switchView(view)
   }

   React.useEffect(() => {
      if (sachet) {
         if (weight < sachet.displayUnitQuantity) {
            setScaleState('low')
         } else if (weight > sachet.displayUnitQuantity) {
            setScaleState('above')
         } else if (weight === sachet.displayUnitQuantity) {
            setScaleState('match')
         }
      }
   }, [weight, sachet])

   const print = React.useCallback(async () => {
      if (!sachet?.operationConfig?.labelTemplateId) {
         toast.error('No template assigned!')
         return
      }
      if (state.print.print_simulation.value.isActive) {
         const template = encodeURIComponent(
            JSON.stringify({
               name: sachet?.operationConfig?.labelTemplate?.name,
               type: 'label',
               format: 'html',
            })
         )

         const data = encodeURIComponent(
            JSON.stringify({
               id: sachet.id,
            })
         )
         const url = `${get_env(
            'REACT_APP_TEMPLATE_URL'
         )}?template=${template}&data=${data}`
         setLabelPreview(url)
      } else {
         const url = `${new URL(get_env('REACT_APP_DATA_HUB_URI')).origin
            }/datahub/v1/query`

         const data = { id: sachet.id, status: 'READY' }
         await axios.post(
            url,
            {
               type: 'invoke_event_trigger',
               args: {
                  name: 'printLabel',
                  payload: { new: data },
               },
            },
            {
               headers: {
                  'Content-Type': 'application/json; charset=utf-8',
                  'x-hasura-admin-secret': get_env(
                     'REACT_APP_HASURA_GRAPHQL_ADMIN_SECRET'
                  ),
               },
            }
         )
      }
   }, [sachet])

   React.useEffect(() => {
      let timer
      if (weight === sachet?.displayUnitQuantity) {
         timer = setTimeout(() => {
            print()
         }, 3000)
      }
      return () => clearTimeout(timer)
   }, [weight, sachet, print])

   const hasSOP = () => {
      if (!sachet) return false
      if (!sachet?.bulkItemId || !sachet?.sachetItemId) return false
      if (
         isEmpty(sachet?.bulkItem?.sop?.images || {}) ||
         isEmpty(sachet?.sachetItem?.bulkItem?.sop?.images || {})
      )
         return false
      return true
   }

   if (isNull(id)) {
      return (
         <Wrapper>
            <StyledMode>
               <Flex container alignItems="center">
                  <label htmlFor="mode">Mode</label>
                  <Tooltip identifier="left_panel_mode" />
               </Flex>
               <select
                  id="mode"
                  name="mode"
                  value={currentView}
                  onChange={e => changeView(e.target.value)}
               >
                  <option value="SUMMARY">Summary</option>
                  <option value="SACHET_ITEM">Process Sachet</option>
               </select>
            </StyledMode>
            <Flex margin="16px 0">
               <Text as="h3">No sachet selected!</Text>
            </Flex>
         </Wrapper>
      )
   }
   if (isLoading) return <InlineLoader />
   if (error) {
      setIsLoading(false)
      logger(error)
      toast.error('Failed to fetch sachet details!')
      return (
         <Wrapper>
            <StyledMode>
               <Flex container alignItems="center">
                  <label htmlFor="mode">Mode</label>
                  <Tooltip identifier="left_panel_mode" />
               </Flex>
               <select
                  id="mode"
                  name="mode"
                  value={currentView}
                  onChange={e => changeView(e.target.value)}
               >
                  <option value="SUMMARY">Summary</option>
                  <option value="SACHET_ITEM">Process Sachet</option>
               </select>
            </StyledMode>
            <ErrorState message="Failed to fetch sachet details!" />
         </Wrapper>
      )
   }
   return (
      <Wrapper>
         <StyledIconButton
            style={{ marginTop: '16px' }}
            type="outline"
            size="sm"
            onClick={() => closeOrderSummaryTunnel(1)}
         >
            <CloseIcon />
         </StyledIconButton>
         <StyledMode>
            <Flex container alignItems="center">
               <label htmlFor="mode">Mode</label>
               <Tooltip identifier="left_panel_mode" />
            </Flex>
            <select
               id="mode"
               name="mode"
               value={currentView}
               onChange={e => changeView(e.target.value)}
            >
               <option value="SUMMARY">Summary</option>
               <option value="SACHET_ITEM">Process Sachet</option>
            </select>
         </StyledMode>
         <StyledHeader>
            <h3>{product?.name || 'N/A'}</h3>
         </StyledHeader>
         <StyledMain>
            <section>
               <h4>{sachet.displayName.split('->').pop().trim()}</h4>
               <StyledStat status={sachet.status}>{sachet.status}</StyledStat>
            </section>
            <section>
               <section>
                  <span>Supplier Item</span>
                  <span>{sachet?.supplierItem?.supplierItemName || 'N/A'}</span>
               </section>
               <section>
                  <span>Processing Name</span>
                  <span>{sachet.processingName}</span>
               </section>
               <section>
                  <span>Quantity</span>
                  <span>
                     {sachet.displayUnitQuantity}
                     {sachet.displayUnit}
                  </span>
               </section>
            </section>
            <StyledWeigh state={scaleState}>
               <header>
                  <span>
                     <ScaleIcon size={24} color="#fff" />
                  </span>
               </header>
               <h2>
                  {weight}
                  {sachet.unit}
               </h2>
               {weight > 0 && weight > sachet.displayUnitQuantity && (
                  <h3>
                     Reduce weight by{' '}
                     {Math.abs(sachet.displayUnitQuantity - weight)}
                     {sachet.displayUnit}
                  </h3>
               )}
               {weight > 0 && weight < sachet.displayUnitQuantity && (
                  <h3>
                     Add {Math.abs(sachet.displayUnitQuantity - weight)}
                     {sachet.displayUnit} more
                  </h3>
               )}
               <span />
            </StyledWeigh>
            {sachet.status === 'PENDING' &&
               state.scale.weight_simulation.value.isActive && (
                  <Flex container alignItems="center">
                     <Form.Group>
                        <Form.Stepper
                           id="weight"
                           name="weight"
                           value={weight || ''}
                           placeholder="Enter the weight"
                           onChange={value => setWeight(value || 0)}
                        />
                     </Form.Group>
                     <Spacer size="8px" xAxis />
                     <TextButton
                        type="outline"
                        onClick={() => setWeight(sachet.displayUnitQuantity)}
                     >
                        Match
                     </TextButton>
                  </Flex>
               )}
         </StyledMain>
         {labelPreview && (
            <Flex margin="16px 0">
               <Flex
                  container
                  as="header"
                  width="300px"
                  alignItems="center"
                  justifyContent="space-between"
               >
                  <Text as="h3">Label Preview</Text>
                  <IconButton
                     size="sm"
                     type="ghost"
                     onClick={() => setLabelPreview('')}
                  >
                     <CloseIcon size={22} />
                  </IconButton>
               </Flex>
               <Spacer size="8px" />
               <iframe
                  src={labelPreview}
                  frameBorder="0"
                  title="label preview"
               />
            </Flex>
         )}
         <Spacer size="16px" />
         {sachet?.operationConfig?.packagingId && (
            <>
               <StyledPackaging>
                  <Flex as="aside" container alignItems="center">
                     <Text as="h3">Packaging</Text>
                     <Tooltip identifier="process_mealkit_section_packaging_heading" />
                  </Flex>
                  <span>
                     {sachet?.operationConfig?.packaging?.name || 'N/A'}
                  </span>
                  <section
                     title={sachet?.operationConfig?.packaging?.name || 'N/A'}
                  >
                     {Array.isArray(
                        sachet?.operationConfig?.packaging?.assets?.images
                     ) &&
                        !isEmpty(
                           sachet?.operationConfig?.packaging?.assets?.images
                        ) && (
                           <img
                              src={
                                 sachet?.operationConfig?.packaging?.assets
                                    ?.images[0].url
                              }
                              alt={
                                 sachet?.operationConfig?.packaging?.name ||
                                 'N/A'
                              }
                              title={
                                 sachet?.operationConfig?.packaging?.name ||
                                 'N/A'
                              }
                           />
                        )}
                  </section>
               </StyledPackaging>
               <Spacer size="16px" />
            </>
         )}
         {hasSOP() && (
            <>
               <StyledSOP>
                  <Flex as="aside" container alignItems="center">
                     <Text as="h3">SOP</Text>
                     <Tooltip identifier="process_mealkit_section_sop_heading" />
                  </Flex>
                  <section>
                     {sachet?.bulkItemId &&
                        !isEmpty(sachet?.bulkItem?.sop?.images || {}) && (
                           <img
                              src={sachet?.bulkItem?.sop?.images[0].url}
                              alt="SOP"
                           />
                        )}
                     {sachet?.sachetItemId &&
                        !isEmpty(
                           sachet?.sachetItem?.bulkItem?.sop?.images || {}
                        ) && (
                           <img
                              src={
                                 sachet?.sachetItem?.bulkItem?.sop?.images[0]
                                    .url
                              }
                              alt="SOP"
                           />
                        )}
                  </section>
               </StyledSOP>
               <Spacer size="16px" />
            </>
         )}
         <ActionsWrapper container alignItems="center">
            <TextButton
               size="sm"
               type="solid"
               disabled={sachet.status !== 'PENDING'}
               fallBackMessage="Pending order confirmation!"
               hasAccess={Boolean(
                  sachet?.cart?.order?.isAccepted &&
                  !sachet?.cart?.order?.isRejected
               )}
               onClick={() =>
                  updateCartItem({
                     variables: {
                        id: sachet.id,
                        _set: {
                           status: 'READY',
                        },
                     },
                  })
               }
            >
               {sachet.status !== 'PENDING' ? 'Ready' : 'Mark Ready'}
            </TextButton>
            <Spacer size="16px" xAxis />
            <TextButton
               size="sm"
               type="solid"
               disabled={sachet.status === 'PACKED'}
               fallBackMessage="Pending order confirmation!"
               hasAccess={Boolean(
                  sachet?.cart?.order?.isAccepted &&
                  !sachet?.cart?.order?.isRejected
               )}
               onClick={() =>
                  updateCartItem({
                     variables: {
                        id: sachet.id,
                        _set: {
                           status: 'PACKED',
                        },
                     },
                  })
               }
            >
               {sachet.status === 'PACKED' ? 'Packed' : 'Mark Packed'}
            </TextButton>
         </ActionsWrapper>
         {!isNull(sachet.operationConfig?.labelTemplateId) && (
            <>
               <Spacer size="16px" />
               <PrintButton size="sm" type="outline" onClick={print}>
                  Print Label
               </PrintButton>
            </>
         )}
      </Wrapper>
   )
}

const ActionsWrapper = styled(Flex)`
   display: flex;
   > button {
      flex: 1;
   }
`

const PrintButton = styled(TextButton)`
   width: 100%;
`
