import React from 'react'
import { toast } from 'react-toastify'
import { useMutation, useSubscription } from '@apollo/react-hooks'
import {
   Tag,
   Text,
   Form,
   Tunnel,
   Spacer,
   Tunnels,
   PlusIcon,
   useTunnel,
   IconButton,
   ComboButton,
   TunnelHeader,
   HorizontalTab,
   HorizontalTabs,
   HorizontalTabList,
   HorizontalTabPanel,
   HorizontalTabPanels,
} from '@dailykit/ui'

import { usePlan } from '../state'
import ItemCount from './ItemCount'
import { Stack } from '../../../../styled'
import { logger } from '../../../../../../shared/utils'
import {
   Flex,
   Tooltip,
   ErrorState,
   InlineLoader,
   ErrorBoundary,
   Banner,
} from '../../../../../../shared/components'
import {
   EditIcon,
   TickIcon,
   CloseIcon,
} from '../../../../../../shared/assets/icons'
import {
   SERVING,
   UPSERT_ITEM_COUNT,
   UPSERT_SUBSCRIPTION_SERVING,
} from '../../../../graphql'

const Serving = ({ id, isActive, toggleServingTunnel }) => {
   const { state, dispatch } = usePlan()
   const [tabIndex, setTabIndex] = React.useState(0)
   const [tunnels, openTunnel, closeTunnel] = useTunnel(1)
   const [upsertServing] = useMutation(UPSERT_SUBSCRIPTION_SERVING)
   const [itemTunnelState, setItemTunnelState] = React.useState('')
   const {
      error,
      loading,
      data: { serving = {} } = {},
   } = useSubscription(SERVING, {
      variables: { id },
      onSubscriptionData: ({
         subscriptionData: { data: { serving: node = {} } = {} } = {},
      }) => {
         dispatch({
            type: 'SET_SERVING',
            payload: {
               id: node.id,
               size: Number(node.size),
               isActive: node.isActive,
               isDefault: state.title.defaultServing.id === node.id,
            },
         })
      },
   })

   React.useEffect(() => {
      return () => {
         dispatch({
            type: 'SET_SERVING',
            payload: {
               id: null,
               size: '',
               isDefault: false,
            },
         })
      }
   }, [dispatch])

   const editServing = () => {
      toggleServingTunnel('EDIT_SERVING')
   }

   const toggleItemCountTunnel = type => {
      openTunnel(1)
      setItemTunnelState(type)
   }

   const toggleIsActive = () => {
      if (!state.serving.isActive && !serving.isValid) {
         toast.error('Can not be published without any active item counts!', {
            position: 'top-center',
         })
         return
      }

      upsertServing({
         variables: {
            object: {
               id: state.serving.id,
               isActive: !state.serving.isActive,
               subscriptionTitleId: state.title.id,
               servingSize: Number(state.serving.size),
            },
         },
      })
   }

   if (loading) return <InlineLoader />
   if (error) {
      toast.error('Failed to fetch item counts!')
      logger(error)
      return <ErrorState message="Failed to fetch item counts!" />
   }
   return (
      <>
         <Flex
            container
            height="48px"
            alignItems="center"
            justifyContent="space-between"
         >
            <Stack xAxis>
               <Text as="h2" style={{ marginBottom: '0px' }}>
                  Serving: {serving.size}
               </Text>
               <Spacer size="14px" xAxis />
               {serving.id === state.title.defaultServing.id && (
                  <Tag>Default</Tag>
               )}
               <Spacer size="14px" xAxis />
               {serving.isDemo && <Tag>Demo</Tag>}
            </Stack>
            <Stack>
               {serving.isValid ? (
                  <Flex container flex="1" alignItems="center">
                     <TickIcon size={20} color="green" />
                     <Spacer size="8px" xAxis />
                     <Text as="subtitle">All good!</Text>
                  </Flex>
               ) : (
                  <Flex container flex="1" alignItems="center">
                     <CloseIcon size={8} color="red" />
                     <Spacer size="8px" xAxis />
                     <Text as="subtitle">
                        Must have atleast one active item count!
                     </Text>
                  </Flex>
               )}
               <Spacer size="24px" xAxis />
               <Flex container alignItems="center">
                  <Form.Toggle
                     name="publish_serving"
                     onChange={toggleIsActive}
                     value={state.serving.isActive}
                  >
                     Publish
                  </Form.Toggle>
                  <Tooltip identifier="form_subscription_section_serving_publish" />
               </Flex>
               <Spacer size="16px" xAxis />
               <IconButton
                  size="sm"
                  type="outline"
                  onClick={() => editServing()}
               >
                  <EditIcon size={14} />
               </IconButton>
            </Stack>
         </Flex>
         <hr style={{ border: '1px solid #ededed' }} />
         <Spacer size="8px" />
         <Flex container alignItems="center" justifyContent="space-between">
            <Flex container alignItems="center">
               <Text as="h3" style={{ marginBottom: '0px' }}>
                  Items Counts
               </Text>
               <Tooltip identifier="form_subscription_section_item_count_heading" />
            </Flex>
            <IconButton
               size="sm"
               type="outline"
               onClick={() => toggleItemCountTunnel('ADD_ITEM_COUNT')}
            >
               <PlusIcon />
            </IconButton>
         </Flex>
         <Spacer size="8px" />
         {serving.counts.length > 0 ? (
            <HorizontalTabs
               id="itemCountTabs"
               onChange={index => setTabIndex(index)}
            >
               <HorizontalTabList id="itemCountTabList">
                  {serving.counts.map(({ id: key, count }) => (
                     <HorizontalTab key={key}>
                        <Text as="title">{count}</Text>
                     </HorizontalTab>
                  ))}
               </HorizontalTabList>
               <HorizontalTabPanels id="itemCountTabPanels">
                  {serving.counts.map(({ id: key }, index) => (
                     <HorizontalTabPanel key={key}>
                        {index === tabIndex && (
                           <ItemCount
                              id={key}
                              toggleItemCountTunnel={toggleItemCountTunnel}
                              isActive={isActive && index === tabIndex}
                           />
                        )}
                     </HorizontalTabPanel>
                  ))}
               </HorizontalTabPanels>
            </HorizontalTabs>
         ) : (
            <Stack py="24px">
               <ComboButton
                  type="outline"
                  onClick={() => toggleItemCountTunnel('ADD_ITEM_COUNT')}
               >
                  <PlusIcon color="#555b6e" />
                  Add Item Count
               </ComboButton>
            </Stack>
         )}
         <ErrorBoundary rootRoute="/subscription/subscriptions">
            <ItemCountTunnel
               tunnels={tunnels}
               itemTunnelState={itemTunnelState}
               closeTunnel={closeTunnel}
            />
         </ErrorBoundary>
      </>
   )
}

export default Serving

const ItemCountTunnel = ({ tunnels, itemTunnelState, closeTunnel }) => {
   const { state } = usePlan()
   const [form, setForm] = React.useState({
      id: null,
      tax: 0,
      count: '',
      price: '',
      isActive: false,
      isTaxIncluded: false,
   })
   const [upsertItemCount] = useMutation(UPSERT_ITEM_COUNT, {
      onCompleted: () => {
         closeTunnel(1)
         toast.success('Successfully created the item count!')
      },
      onError: error => {
         logger(error)
         toast.error('Failed to create the item count!')
      },
   })

   React.useEffect(() => {
      if (itemTunnelState === 'EDIT_ITEM_COUNT') {
         setForm({
            id: state.item.id,
            tax: state.item.tax,
            count: state.item.count,
            price: state.item.price,
            isActive: state.item.isActive,
            isTaxIncluded: state.item.isTaxIncluded,
         })
      } else {
         setForm({
            id: null,
            tax: 0,
            count: '',
            price: '',
            isActive: false,
            isTaxIncluded: false,
         })
      }
   }, [itemTunnelState, state.item])

   const save = () => {
      const { tax, count, price, isTaxIncluded } = form
      upsertItemCount({
         variables: {
            object: {
               isTaxIncluded,
               tax: Number(tax),
               count: Number(count),
               price: Number(price),
               isActive: form.isActive,
               subscriptionServingId: state.serving.id,
               ...(form.id && { id: form.id }),
            },
         },
      })
   }

   const handleChange = (name, value) => {
      setForm(node => ({ ...node, [name]: value }))
   }

   return (
      <Tunnels tunnels={tunnels}>
         <Tunnel layer="1">
            <TunnelHeader
               title={
                  itemTunnelState === 'ADD_ITEM_COUNT'
                     ? 'Add Item Count'
                     : 'Edit Item Count'
               }
               close={() => closeTunnel(1)}
               right={{
                  title: 'Save',
                  action: () => save(),
                  disabled: !form.count || !form.price,
               }}
               tooltip={
                  <Tooltip identifier="form_subscription_tunnel_item_create" />
               }
            />
            <Banner id="subscription-app-create-subscription-item-count-tunnel-top" />
            <Flex padding="16px">
               <Form.Group>
                  <Form.Label htmlFor="count" title="count">
                     <Flex container alignItems="center">
                        Item Count*
                        <Tooltip identifier="form_subscription_tunnel_item_field_count" />
                     </Flex>
                  </Form.Label>
                  <Form.Number
                     id="count"
                     name="count"
                     onChange={e => handleChange(e.target.name, e.target.value)}
                     value={form.count}
                     placeholder="Enter the item count"
                  />
               </Form.Group>
               <Spacer size="16px" />
               <Form.Group>
                  <Form.Label htmlFor="price" title="price">
                     <Flex container alignItems="center">
                        Price*
                        <Tooltip identifier="form_subscription_tunnel_item_field_price" />
                     </Flex>
                  </Form.Label>
                  <Form.Number
                     id="price"
                     name="price"
                     onChange={e => handleChange(e.target.name, e.target.value)}
                     value={form.price}
                     placeholder="Enter the item price"
                  />
               </Form.Group>
               <Spacer size="16px" />
               <Form.Group>
                  <Form.Label htmlFor="tax" title="tax">
                     Tax*
                  </Form.Label>
                  <Form.Number
                     id="tax"
                     name="tax"
                     value={form.tax}
                     onChange={e => handleChange(e.target.name, e.target.value)}
                     placeholder="Enter the tax"
                  />
               </Form.Group>
               <Spacer size="16px" />
               <Flex container alignItems="center">
                  <Form.Toggle
                     onChange={() =>
                        handleChange('isTaxIncluded', !form.isTaxIncluded)
                     }
                     value={form.isTaxIncluded}
                     name="itemCount_toggle_isTaxIncluded"
                  >
                     Is tax Included?
                  </Form.Toggle>
                  <Tooltip identifier="form_subscription_section_item_count_isTaxIncluded" />
               </Flex>
            </Flex>
            <Banner id="subscription-app-create-subscription-item-count-tunnel-bottom" />
         </Tunnel>
      </Tunnels>
   )
}
