import React from 'react'
import moment from 'moment'
import { RRule } from 'rrule'
import styled from 'styled-components'
import { toast } from 'react-toastify'
import { useSubscription, useMutation } from '@apollo/react-hooks'
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
   SectionTab,
   ComboButton,
   SectionTabs,
   TunnelHeader,
   SectionTabList,
   SectionTabPanel,
   SectionTabPanels,
} from '@dailykit/ui'

import { usePlan } from '../state'
import DeliveryDay from './DeliveryDay'
import { ItemCountSection } from '../styled'
import { Stack } from '../../../../styled'
import {
   ITEM_COUNT,
   INSERT_SUBSCRIPTION,
   UPSERT_ITEM_COUNT,
} from '../../../../graphql'
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

const ItemCount = ({ id, toggleItemCountTunnel }) => {
   const { state, dispatch } = usePlan()
   const [tunnels, openTunnel, closeTunnel] = useTunnel()
   const [upsertItemCount] = useMutation(UPSERT_ITEM_COUNT, {
      onCompleted: () => {
         toast.success('Successfully update the item count!')
      },
      onError: error => {
         logger(error)
         toast.error('Failed to update the item count!')
      },
   })
   const { error, loading, data: { itemCount = {} } = {} } = useSubscription(
      ITEM_COUNT,
      {
         variables: { id },
         onSubscriptionData: ({
            subscriptionData: { data: { itemCount: node = {} } = {} } = {},
         }) => {
            dispatch({
               type: 'SET_ITEM',
               payload: {
                  id: node.id,
                  tax: node.tax,
                  count: node.count,
                  price: node.price,
                  isActive: node.isActive,
                  isTaxIncluded: node.isTaxIncluded,
               },
            })
         },
      }
   )

   React.useEffect(() => {
      return () => {
         dispatch({
            type: 'SET_ITEM',
            payload: {
               id: null,
               count: '',
               price: '',
               tax: 0,
               isActive: true,
               isTaxIncluded: false,
            },
         })
      }
   }, [dispatch])

   const toggleIsActive = () => {
      if (!state.item.isActive && !itemCount.isValid) {
         toast.error('Can not be published without any subscriptions!', {
            position: 'top-center',
         })
         return
      }
      upsertItemCount({
         variables: {
            object: {
               ...state.item,
               isActive: !state.item.isActive,
               subscriptionServingId: state.serving.id,
            },
         },
      })
   }

   if (loading) return <InlineLoader />
   if (error) {
      toast.error('Failed to fetch item count details!')
      logger(error)
      return <ErrorState message="Failed to fetch item count details!" />
   }
   return (
      <>
         <Flex
            container
            height="48px"
            alignItems="center"
            justifyContent="space-between"
         >
            <Flex container alignItems="center">
               <Text as="p">Price per week: {itemCount.price}</Text>
               <Spacer size="14px" xAxis />
               {itemCount.isDemo && <Tag>Demo</Tag>}
            </Flex>
            <Flex container>
               {itemCount.isValid ? (
                  <Flex container flex="1" alignItems="center">
                     <TickIcon size={20} color="green" />
                     <Spacer size="8px" xAxis />
                     <Text as="subtitle">All good!</Text>
                  </Flex>
               ) : (
                  <Flex container flex="1" alignItems="center">
                     <CloseIcon size={20} color="red" />
                     <Spacer size="8px" xAxis />
                     <Text as="subtitle">
                        Must have atleast one delivery day!
                     </Text>
                  </Flex>
               )}
               <Spacer size="24px" xAxis />
               <Flex container alignItems="center">
                  <Form.Toggle
                     name="publish_item_count"
                     onChange={toggleIsActive}
                     value={state.item.isActive}
                  >
                     Publish
                  </Form.Toggle>
                  <Tooltip identifier="form_subscription_sectioon_item_count_publish" />
               </Flex>
               <Spacer size="16px" xAxis />
               <IconButton
                  size="sm"
                  type="outline"
                  onClick={() => toggleItemCountTunnel('EDIT_ITEM_COUNT')}
               >
                  <EditIcon />
               </IconButton>
            </Flex>
         </Flex>
         <ItemCountSection>
            <Flex
               container
               as="header"
               height="48px"
               alignItems="center"
               justifyContent="space-between"
            >
               <Flex container alignItems="center">
                  <Text as="title">Delivery Days</Text>
                  <Tooltip identifier="form_subscription_section_delivery_days_heading" />
               </Flex>
               <IconButton
                  size="sm"
                  type="outline"
                  onClick={() => openTunnel(1)}
               >
                  <PlusIcon />
               </IconButton>
            </Flex>
            {itemCount?.subscriptions.length > 0 ? (
               <SectionTabs id="deliveryDaysTabs">
                  <SectionTabList id="deliveryDaysTabList">
                     {itemCount?.subscriptions.map(subscription => (
                        <SectionTab key={subscription.id}>
                           <Text as="title">
                              {RRule.fromString(subscription.rrule).toText()}
                           </Text>
                        </SectionTab>
                     ))}
                  </SectionTabList>
                  <SectionTabPanels id="deliveryDaysTabPanels">
                     {itemCount?.subscriptions.map(subscription => (
                        <SectionTabPanel key={subscription.id}>
                           <DeliveryDay id={subscription.id} />
                        </SectionTabPanel>
                     ))}
                  </SectionTabPanels>
               </SectionTabs>
            ) : (
               <Stack py="24px">
                  <ComboButton type="outline" onClick={() => openTunnel(1)}>
                     <PlusIcon color="#555b6e" />
                     Add Subscription
                  </ComboButton>
               </Stack>
            )}
            <ErrorBoundary rootRoute="/subscription/subscriptions">
               <SubscriptionTunnel
                  tunnels={tunnels}
                  closeTunnel={closeTunnel}
               />
            </ErrorBoundary>
         </ItemCountSection>
      </>
   )
}

export default ItemCount

const SubscriptionTunnel = ({ tunnels, closeTunnel }) => {
   const { state } = usePlan()
   const [days, setDays] = React.useState({
      sunday: false,
      monday: false,
      tuesday: false,
      wednesday: false,
      thursday: false,
      friday: false,
      saturday: false,
   })
   const [form, setForm] = React.useState({
      cutOffTime: '',
      leadTime: '',
      startTime: '',
      startDate: '',
      endDate: '',
   })
   const close = () => {
      closeTunnel(1)
      setDays({
         sunday: false,
         monday: false,
         tuesday: false,
         wednesday: false,
         thursday: false,
         friday: false,
         saturday: false,
      })
      setForm({
         cutOffTime: '',
         leadTime: '',
         startTime: '',
         startDate: '',
         endDate: '',
      })
   }
   const [insertSubscription] = useMutation(INSERT_SUBSCRIPTION, {
      onCompleted: () => {
         close()
         toast.success('Successfully created the subscription!')
      },
      onError: error => {
         logger(error)
         toast.success('Failed to create the subscription!')
      },
   })

   const save = () => {
      const bridge = {
         monday: 0,
         tuesday: 1,
         wednesday: 2,
         thursday: 3,
         friday: 4,
         saturday: 5,
         sunday: 6,
      }

      const objects = []

      Object.keys(days).forEach(day => {
         if (days[day]) {
            const rule = new RRule({
               freq: RRule.WEEKLY,
               interval: 1,
               wkst: RRule.MO,
               byweekday: bridge[day],
            })
            objects.push({
               rrule: rule.toString(),
               subscriptionItemCountId: state.item.id,
               ...form,
               leadTime: { unit: 'days', value: Number(form.leadTime) },
               startTime: { unit: 'days', value: Number(form.startTime) },
            })
         }
      })

      insertSubscription({
         variables: {
            objects,
         },
      })
   }

   const handleChange = e => {
      const { name, value } = e.target
      const data = {
         ...form,
         [name]: value,
         ...(name === 'startDate' && {
            endDate: moment(value).add(28, 'days').format('YYYY-MM-DD'),
         }),
      }
      setForm(data)
   }

   const selectDay = day => {
      setDays({ ...days, [day]: !days[day] })
   }

   const isValid = () => {
      let result = false
      result = Object.keys(days).some(key => days[key])
      result = Object.keys(form).every(key => form[key])
      return result
   }

   return (
      <Tunnels tunnels={tunnels}>
         <Tunnel layer="1">
            <TunnelHeader
               title="Add Subscription"
               close={() => close()}
               right={{
                  title: 'Save',
                  action: () => save(),
                  disabled: !isValid(),
               }}
            />
            <Banner id="subscription-app-create-subscription-add-subscription-tunnel-top" />
            <Flex padding="16px">
               <section>
                  <Flex container alignItems="center">
                     <Text as="h3">Add delivery days</Text>
                     <Tooltip identifier="form_subscription_tunnel_subscription_field_delivery_days" />
                  </Flex>
                  <Spacer size="16px" />
                  <DeliveryDaysList>
                     {Object.keys(days).map(day => (
                        <li key={day}>
                           <Form.Checkbox
                              name={day}
                              value={days[day]}
                              onChange={() => selectDay(day)}
                           >
                              {day}
                           </Form.Checkbox>
                        </li>
                     ))}
                  </DeliveryDaysList>
               </section>
               <Spacer size="48px" />
               <section>
                  <Flex container alignItems="flex-end">
                     <Form.Group>
                        <Form.Label htmlFor="cutOffTime" title="cutOffTime">
                           <Flex container alignItems="center">
                              Cut Off Time*
                              <Tooltip identifier="form_subscription_tunnel_subscription_field_cut_off_time" />
                           </Flex>
                        </Form.Label>
                        <Form.Time
                           id="cutOffTime"
                           name="cutOffTime"
                           value={form.cutOffTime}
                           onChange={e => handleChange(e)}
                        />
                     </Form.Group>
                     <Spacer size="16px" xAxis />
                     <Form.Group>
                        <Form.Label htmlFor="leadTime" title="leadTime">
                           <Flex container alignItems="center">
                              Lead Time*
                              <Tooltip identifier="form_subscription_tunnel_subscription_field_lead_time" />
                           </Flex>
                        </Form.Label>
                        <Form.Text
                           id="leadTime"
                           name="leadTime"
                           value={form.leadTime}
                           onChange={e => handleChange(e)}
                           placeholder="Enter the lead time in days"
                        />
                     </Form.Group>
                  </Flex>
                  <Spacer size="24px" />
                  <Form.Group>
                     <Form.Label htmlFor="startTime" title="startTime">
                        <Flex container alignItems="center">
                           Start Time*
                           <Tooltip identifier="form_subscription_tunnel_subscription_field_start_time" />
                        </Flex>
                     </Form.Label>
                     <Form.Text
                        id="startTime"
                        name="startTime"
                        value={form.startTime}
                        onChange={e => handleChange(e)}
                        placeholder="Enter the start time in days"
                     />
                  </Form.Group>
                  <Spacer size="24px" />
                  <Flex container>
                     <Form.Group>
                        <Form.Label htmlFor="startDate" title="startDate">
                           <Flex container alignItems="center">
                              Start Date*
                              <Tooltip identifier="form_subscription_tunnel_subscription_field_start_date" />
                           </Flex>
                        </Form.Label>
                        <Form.Date
                           id="startDate"
                           name="startDate"
                           value={form.startDate}
                           onChange={e => handleChange(e)}
                        />
                     </Form.Group>
                     <Spacer size="16px" xAxis />
                     <Form.Group>
                        <Form.Label htmlFor="endDate" title="endDate">
                           <Flex container alignItems="center">
                              End Date*
                              <Tooltip identifier="form_subscription_tunnel_subscription_field_end_date" />
                           </Flex>
                        </Form.Label>
                        <Form.Date
                           disabled
                           id="endDate"
                           name="endDate"
                           value={form.endDate}
                           onChange={e => handleChange(e)}
                        />
                     </Form.Group>
                  </Flex>
               </section>
            </Flex>
            <Banner id="subscription-app-create-subscription-add-subscription-tunnel-bottom" />
         </Tunnel>
      </Tunnels>
   )
}

const DeliveryDaysList = styled.ul`
   display: grid;
   grid-gap: 16px;
   grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
   li {
      list-style: none;
      label {
         margin-left: 12px;
         text-transform: capitalize;
      }
   }
`
